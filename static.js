/*************************静态文件托管服务************************************/
var PORT = 8000;
var http = require('http');
var url = require('url');
var fs = require("fs");
var path = require("path");
var mime = require("./mime").types;
//一个独立于express的纯node静态资源服务器
var server = http.createServer(function (request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    response.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    response.setHeader("X-Powered-By",' 3.2.1');
    response.setHeader("Content-Type", "application/json;charset=utf-8");
    var pathname = url.parse(request.url).pathname;
    var realPath = "static" + pathname;//http://localhost:8000将访问static目录
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    fs.readFile(realPath, "binary", function (err, file) {
        if (err) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });

            response.end(err);
        } else {
            console.log("get "+realPath+" success");
            var contentType = mime[ext] || "text/plain";
            response.writeHead(200, {'Content-Type': contentType});
            response.write(file, "binary");
            response.end(realPath);
        }
    })
});

server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");