# Streaming Audio over TCP and WebSockets with node.js


## Installation Steps

### Get the code on local/production machine

### Install Dependencies for Server

Install
```
npm install
```

### Install Dependencies for Stream Ingester

Install
```
cd websocket-streamer

```

```
npm install
```

### Data Flow
```
Streamer ---TCP---> NODE.JS Server -- WebSockets --> [client 0] MediaSource Audio
                                |-- WebSockets --> [client 1] MediaSource Audio
                                |-- WebSockets --> [client 2] MediaSource Audio
```
## How to use

Start application
``` 
node server/app.js websocket-streamer/config.json
```
In browser go to `localhost:8080`

Start Stream Ingester
```
cd websocket-streamer

node index.js config.json
```

According to audio / video codec set `codecString` in `client/static/scripts/primary.js` line `23` to right value.

You can customize HTTP port in `websocket-streamer\config.json` at line 59. 
