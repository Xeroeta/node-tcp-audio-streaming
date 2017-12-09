(window => {
  'use strict';


mediaSource = new MediaSource();
audio = new window.Audio(window.URL.createObjectURL(mediaSource));
buffer = null;
queue = [];

  class MediaSourceHandler {
      
    constructor (uid) {
      
      this.codecString = 'audio/mp4; codecs="mp4a.67"';
      this.audio = null;
      
//      this.audio = document.getElementById('audio');
//      this.audio.src = window.URL.createObjectURL(this.mediaSource);
      this.bufferArray = [];
      this.currentUid = uid;
    }

    updateBuffer() {
        if (this.queue.length > 0 && !this.buffer.updating) {
            this.buffer.appendBuffer(this.queue.shift());
        }
    }

    initWS(uid) {
      console.log('initialising web socket for - ' + uid);
      var ws = new WebSocket('ws://' + window.location.hostname + ':' + 
              window.location.port + '/channel/'+uid, 'echo-protocol');
      ws.binaryType = "arraybuffer";

      ws.onopen = function(){
          console.info('WebSocket connection initialized');
      };

      ws.onmessage = function (event) {
          console.info('Recived WS message.', event);

          if(typeof event.data === 'object'){
              if (this.buffer.updating || this.queue.length > 0) {
                  this.queue.push(event.data);
              } else {
                  this.buffer.appendBuffer(event.data);
                  this.audio.play();
              }
          }
      };
      ws.onclose = function(){ console.info('WebSocket connection closed') }
    }

    sourceBufferHandle() {
        console.log("Handling source buffer" + this.currentUid);
        this.buffer = mediaSource.addSourceBuffer(this.codecString);
        this.buffer.mode = 'sequence';

        console.log('adding sourceBufferHandle');
        buffer.addEventListener('update', function() { // Note: Have tried 'updateend'
            console.log('update');
            this.updateBuffer();
        });

        buffer.addEventListener('updateend', function() {
            console.log('updateend');
            this.updateBuffer();
        });

        this.initWS(this.currentUid);
    }

  }


  // manages the stream audio
  class Player {
      
    constructor () {
      this.audio = null;
      this.buffer = null;
      this.queue = [];
      this.bufferArray = [];
      this.currentUid = null;
    }

    play (uid) {
      console.log("Opening stream: "+uid);
      this.currentUid = uid;
      mediaSource.addEventListener('sourceopen', this.sourceBufferHandle);
      console.log("Source open listener added");
//      this.audio = new window.Audio(`/${uid}`);
//      this.audio.play();
    }

    stop () {
      this.audio.pause();
      this.audio.src = '';
      //this.audio.currentTime = 0;
    }
  }

  // manages the notification message
  class Message {
    constructor () {
      this.element = window.document.querySelector('.message');

      this.element.addEventListener('click', this.dismiss);
    }

    // dismiss the message
    dismiss (event) {
      event.target.classList.remove('message_visible');
      event.target.classList.remove('message_error');

      window.setTimeout(() => {
        event.target.classList.add('hidden');
      }, 300);
    }

    // set and display the message
    set (text, state) {
      this.element.textContent = text;

      this.element.classList.add('message_visible');
      this.element.classList.add('message_' + (state || 'error'));

      this.element.classList.remove('hidden');
    }
  }

  // manages a single stream
  class Stream {
    constructor (element, click) {
      this.element = element;

      this.element.addEventListener('click', event => click(this));
    }

    set state (state) {
      this.element.classList.remove('stream_playing');
      this.element.classList.remove('stream_buffering');

      if (state)
        this.element.classList.add('stream_' + state);
    }

    get uid () {
      return this.element.getAttribute('data-uid');
    }
  }

  // manages the interface
  class UI {
    constructor () {
      this.current = null;
      this.message = null;
      this.player = null;
    }

    // initialise the streams
    init () {
      this.message = new Message();
      this.player = new Player();

      for (let stream of window.document.querySelectorAll('.stream'))
        new Stream(stream, stream => this.click(stream));
    }

    // triggered when a stream is clicked on
    click (stream) {
      if (this.current) {
        this.current.state = null;
        this.player.stop();
      }

      if (stream == this.current) {
        this.current = null;
      } else {
        this.current = stream;
        this.current.state = 'buffering';
        
//        console.log('this.current.uid'+this.current.uid);
        this.player.play(this.current.uid);
      }
    }
  }

  const ui = new UI();

  // make app run when dom is ready
  window.document.addEventListener('DOMContentLoaded', event => {
    ui.init();
  });
})(window);

