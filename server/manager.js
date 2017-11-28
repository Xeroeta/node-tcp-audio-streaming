'use strict';

const crypto = require('crypto');
const express = require('express');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const mime = require('mime-types');
const stream = require('stream');

// get sha256 in hex string
const hash = string => {
  const f = crypto.createHash('sha256');

  f.update(string);
  return f.digest('hex')
}

// manages a single stream
class Stream {
  constructor (stream, encoding) {
    this.name = stream.name;
    this.source = stream.source;

    this.encoding = encoding;

    this.mime = mime.lookup(this.encoding.format);

    this.encoder = null;
    this.output = null;
    this.connections = 0;

    this.initialise();
  }

  initialise () {
      
  }

  // connect
  connect () {
    this.connections += 1;
    this.update();
  }

  // close stream
  disconnect () {
    this.connections -= 1;
    this.update();
  }

  // pipe stream to client request response
  pipe (response) {
//    response.contentType(this.mime);
    this.output.pipe(response, {end: true});
  }

  // pause process if not actively requested
  update () {
    console.log(`${this.connections} user(s) connected to '${this.name}'`);

    // pause processes when not used, causes problems with http streams
    if (this.connections > 0) {
      // this.encoder.kill('SIGCONT');
    } else {
      //this.encoder.kill('SIGSTOP');
    }
  }
}

// manages streams
class Manager {
  constructor (config) {
    this.streams = {};

    for (let stream of config.streams || []) {
      this.streams[hash(stream.source)] = new Stream(stream, config.encoding);
    }
  }

  // make sure encoder processes exit properly
  stop () {
    for (let uid of Object.keys(this.streams)) {
      this.streams[uid].encoder.kill('SIGCONT');
    }
  }
}

module.exports = Manager;
