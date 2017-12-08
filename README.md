# Streaming Video over TCP and WebSockets with node.js

This is experimental streaming server in node.js. Ingest stream is sent over TCP to server then it is redistributed to all clients over WebSockets.

## Ingest stream
[FFMPEG](https://ffmpeg.org/) can be used to ingest  stream. In this example I use [v4l2](https://trac.ffmpeg.org/wiki/Capture/Webcam) to caputre camera on linux.
```
-f v4l2 -framerate 25 -video_size 640x480 -i /dev/video0
```
### VP8 (using libvpx)
```
ffmpeg -f v4l2 -framerate 25 -video_size 640x480 -i /dev/video0  -vcodec libvpx -b:v 3500k -r 25 -crf 10 -quality realtime -speed 16 -threads 8 -an -g 25 -f webm tcp://localhost:9090
```
### H.264 (using libx264)
To stream MP4 it needs to be [ISO BMFF](https://en.wikipedia.org/wiki/ISO_base_media_file_format) compatible, so `-movflags` is set to `empty_moov+default_base_moof`.

```
ffmpeg -f v4l2 -framerate 25 -video_size 640x480 -i /dev/video0  -vcodec libx264 -profile:v main -g 25 -r 25 -b:v 500k -keyint_min 250 -strict experimental -pix_fmt yuv420p -movflags empty_moov+default_base_moof -an -preset ultrafast -f mp4 tcp://localhost:9090
```
## Stream flow

```
FFMPEG ---TCP---> NODE.JS Server -- WebSockets --> [client 0] MediaSource Video
                                |-- WebSockets --> [client 1] MediaSource Video
                                |-- WebSockets --> [client 2] MediaSource Video
```
Ingest stream is sent over TCP to node.js server. Every packet of stream is sent to clients using WebSockets. 

[MediaSource](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource) is used to retrive video stream. 

## How to use

Install
```
npm install
```

Start application
``` 
gulp 
```
In browser go to `localhost:8080`

Stream video to `tcp://localhost:9090`
```
ffmpeg (...) tcp://localhost:9090
```

According to video codec set `codecString` in `client/js/app.js` line `9` to right value.

You can customize ports in `server\app.js` lines `12` and `13`. 

## 'First packet' hack :)

There is little hack in lines `41-44` and `68-76`. Server stores beginning of stream in array which is sent to every new client. Every client will receive couple of start frames.

Without that hack video won't start for users who start watching in the middle of stream. Perhaps there is solution in better ffmpeg setting. 



ffmpeg version N-89041-g91a565e20f Copyright (c) 2000-2017 the FFmpeg developers
  built with gcc 7.2.0 (GCC)
  configuration: 
--enable-gpl --enable-version3 --enable-sdl2 --enable-bzlib --enable-fontconfig --enable-gnutls --enable-iconv --enable-libass --enable-libbluray --enable-libfreetype --enable-libmp3lame --enable-libopenjpeg --enable-libopus --enable-libshine --enable-libsnappy --enable-libsoxr --enable-libtheora --enable-libtwolame --enable-libvpx --enable-libwavpack --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxml2 --enable-libzimg --enable-lzma --enable-zlib --enable-gmp --enable-libvidstab --enable-libvorbis --enable-cuda --enable-cuvid --enable-d3d11va --enable-nvenc --enable-dxva2 --enable-avisynth --enable-libmfx

  libavutil      56.  0.100 / 56.  0.100
  libavcodec     58.  3.101 / 58.  3.101
  libavformat    58.  2.100 / 58.  2.100
  libavdevice    58.  0.100 / 58.  0.100
  libavfilter     7.  0.101 /  7.  0.101
  libswscale      5.  0.101 /  5.  0.101
  libswresample   3.  0.101 /  3.  0.101
  libpostproc    55.  0.100 / 55.  0.100


ffmpeg version 3.4 Copyright (c) 2000-2017 the FFmpeg developers
  built with Apple LLVM version 9.0.0 (clang-900.0.37)
  configuration: --prefix=/usr/local/Cellar/ffmpeg/3.4 
--enable-shared --enable-pthreads --enable-version3 
--enable-hardcoded-tables --enable-avresample --cc=clang 
--host-cflags= --host-ldflags= --enable-gpl 
--enable-libmp3lame --enable-libx264 --enable-libxvid 
--enable-opencl --enable-videotoolbox 
--disable-lzma

  libavutil      55. 78.100 / 55. 78.100
  libavcodec     57.107.100 / 57.107.100
  libavformat    57. 83.100 / 57. 83.100
  libavdevice    57. 10.100 / 57. 10.100
  libavfilter     6.107.100 /  6.107.100
  libavresample   3.  7.  0 /  3.  7.  0
  libswscale      4.  8.100 /  4.  8.100
  libswresample   2.  9.100 /  2.  9.100
  libpostproc    54.  7.100 / 54.  7.100
r