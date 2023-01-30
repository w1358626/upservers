# Upserver

    Upserver是一个支持多媒体资源从前端文件上传，到后端文件接收并保存到服务端指定目录，最后为文件存储目录提供静态资源托管服务的项目实战案例。支持图片、音频、视频文件上传，为视频提供截图制作封面功能，封面图和视频文件一同托管在服务器，上传完成后即可获得访问链接。


## 准备

<font color="red">**Tip：windows环境**</font>

  一、安装node，[node官网](https://nodejs.org/en/)下载;

  二、安装ffmpeg，[ffmpeg官网](https://github.com/BtbN/FFmpeg-Builds/releases)下载。压缩包解压后，将bin目录地址加到环境变量path里，window+r 在cmd命令窗口输入 'ffmpeg -version'，显示版本信息说明安装成功。

  三、安装项目依赖，npm i。

  四、安装supervisor，npm install -g supervisor。

## 使用

  一、打开upserver项目bin目录，cmd窗口输入 'supervisor www' 启动node后台服务接收文件。

  二、用浏览器打开upserverTest.html，按F12选网络。选择文件上传，上传成功后在请求响应值中可看到托管资源链接。

  三、在upserver项目bin目录，cmd窗口输入 'supervisor static.js' 启动静态资源服务器，即可访问上传成功后的资源链接。
