var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var fs = require("fs");
var path = require("path");
var multiparty = require('multiparty'); /*上传*/
var ffmpeg = require('fluent-ffmpeg');
var mime = require("../mime").types;

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
/*************** 文件上传数据处理接口****************/
router.post('/upload', function (req, res, next) {
  console.log("上传开始");
  var state = '';
  var mainId = new Date().getTime();
  var form = new multiparty.Form({
    uploadDir: './static/',
    /*设置文件保存路径 */
    encoding: 'utf-8',
    /*编码设置 */
    maxFilesSize: 20000 * 1024 * 1024,
    /*设置文件最大值 20MB */
    keepExtensions: true,
    /*保留后缀*/
  });
  console.log("req===>>>", req.files);
  form.parse(req, function (err, field, files) {
    if (err) { console.log(err); }
    console.log('执行')
    console.log(files)
    var results = [];
    var save = function () {
      var dir = "";
      var extname = files.file[0].originalFilename.split(".");
      var random = Math.floor(Math.random() * 772342349);
      var oldPath = '' + files.file[0].path;
      var result = dir + '/' + mainId + random + '.' + extname[extname.length - 1];
      var newPath = 'static/' + dir + '/' + mainId + random + '.' + extname[extname.length - 1];
      var type = extname[extname.length - 1];
      console.log(extname[extname.length - 1])
      if (extname[extname.length - 1] == ("jpg") || extname[extname.length - 1] == ("gif") || extname[extname.length - 1] == ("jpeg") || extname[extname.length - 1] == ("png")) {
        dir = 'images';
        state = 'end';//结束标志
        result = dir + '/' + mainId + random + '.' + extname[extname.length - 1];
        newPath = 'static/' + dir + '/' + mainId + random + '.' + extname[extname.length - 1];
        console.log(dir)
      }
      if (extname[extname.length - 1] == ('mp4' || 'flv' || 'avi')) {
        dir = 'video_cache';
        if (extname[extname.length - 1] == 'mp4') {
          dir = 'videos';
        }
        newPath = 'static/' + dir + '/' + mainId + random + '.' + extname[extname.length - 1];
        var newFile = newPath.split('/');
        newFile = newFile[2];
        newFile = newFile.split('.');
        newFile = newFile[0];
        var videoImage = newFile + '.png';
        ffmpeg(newPath)
          .screenshots({
            timestamps: ['8.5'],//[30.5, '50%', '01:10.123']
            filename: videoImage,
            folder: './static/images',
            size: '220x120'
          })
          .on('end', function () {
            state = 'end';//转换结束标志
            console.log(' screenshots  is Finished !');
          });
        console.log(dir)
      }
      if (extname[extname.length - 1] == ("mp3" || "MP3")) {
        dir = 'audios';
        state = 'end';//结束标志
        result = dir + '/' + mainId + random + '.' + extname[extname.length - 1];
        newPath = 'static/' + dir + '/' + mainId + random + '.' + extname[extname.length - 1];
        console.log(dir)
      }
      if (dir == "") {
        res.end("not allowed")
      }
      console.log('uploaded:' + newPath);
      fs.renameSync(oldPath, newPath);
      var outPath;
      if (dir == 'video_cache' && extname[extname.length - 1] != 'mp4') {
        var filePath = newPath.split('/');
        filePath = filePath[2].split('.');
        var screen = '';
        screen = filePath[0] + '.png';
        outPath = filePath[0] + '.flv';
        result = 'videos/' + outPath;
        var D = 'static/video_cache/';  //存放视频文件的目录
        var L = './images/fly.png';  //水印
        var R = 'rtmp://txy.live-send.acg.tv/live-txy/';  //推流地址
        var C = '?streamname=live_4669771_4358269&key=a387ef5965ce24df5512345e727e89da';  //推流参数
        var O = 'static/videos/' + outPath;  //测试输出，一般填写“文件名+.格式”的形式，留空则不启用
        function liveON() {
          var V = fs.readdirSync(D);
          var N = V.length;
          var ID = Math.floor(Math.random() * N);
          var inputPath = D + V[ID];
          var outputPath = O == '' ? (R + C) : O;
          console.log(' Find ' + N + ' Video Files !');
          ffmpeg(inputPath)
            .inputOptions('-re')
            .inputOptions('-ac 2')
            .addInput(L)
            .complexFilter([{
              filter: 'scale',
              options: [1280, -1],
              inputs: '[0:v]',
              outputs: 'video'
            }, {
              filter: 'scale',
              options: [120, -1],
              inputs: '[1:v]',
              outputs: 'logo'
            }, {
              filter: 'overlay',
              options: {
                x: 'main_w-overlay_w-15',
                y: 15
              },
              inputs: ['video', 'logo']
            }])
            .screenshots({
              timestamps: ['0.5', '1'],
              filename: screen,
              folder: './static/images/',
              size: '220x120'
            })
            .on('start', function (commandLine) {
              //console.log('Spawned Ffmpeg with command: ' + commandLine);
              console.log('Vedio "' + V[ID] + '" is Pushing !');
              console.log(' Spawned Ffmpeg with command !');
            })
            .on('error', function (err, stdout, stderr) {
              console.log('error: ' + err.message);
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
            })
            .on('end', function () {
              state = 'end';//转换结束标志
              fs.unlinkSync(newPath);//删除转换前的视频
              console.log(' Vedio "' + V[ID] + '" Pushing is Finished !');
            })
            .addOptions([
              '-vcodec libx264',
              '-preset veryfast',
              '-crf 22',
              '-maxrate 1000k',//
              '-bufsize 3000k',
              '-acodec libmp3lame',
              '-ac 2',
              '-ar 44100',
              '-b:a 96k'
            ])
            .format('flv')
            .output(outputPath, {
              end: true
            })
            .run();
        }
        liveON();
        var video = { video: 'http://localhost:8000/' + result, image: 'http://localhost:8000/images/' + screen, type: 'flv' };
        results.push(video);
      } else {
        if (extname[extname.length - 1] != 'mp4') {
          if (type == 'mp3') {
            results.push({ mp3: 'http://localhost:8000/' + result });
          } else {
            results.push({ image: 'http://localhost:8000/' + result });
          }

        } else {
          results.push({ video: 'http://localhost:8000/videos' + result, image: 'http://localhost:8000/images/' + videoImage, type: 'mp4' })
        }
      }
    };
    save();
    var back = function () {
      setTimeout(function () {
        if (state == 'end') {
          console.log(results)
          results = JSON.stringify(results);
          res.end(results);
        } else {
          back();
        }
      }, 1000)
    };
    back();
  });

});

module.exports = router;



