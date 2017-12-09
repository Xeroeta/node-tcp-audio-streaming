(window => {
  'use strict';


//var mediaSource = new MediaSource();
//var audio = new window.Audio(window.URL.createObjectURL(mediaSource));
//var buffer = null;
//var queue = [];
//var codecString = 'audio/mp4; codecs="mp4a.67"';

  // manages the stream audio
  class Player {
      
    constructor () {
      this.audio = null;
      this.buffer = null;
      this.queue = [];
      this.bufferArray = [];
      this.currentUid = null;
      /** WebSocket */
      this.ws = null;
      
      this.codecString = 'audio/mp4; codecs="mp4a.67"';      
      this.mediaSource = new MediaSource();
      this.audio = new window.Audio(window.URL.createObjectURL(this.mediaSource));
//      this.audio = document.getElementById('audio');
//      this.audio.src = window.URL.createObjectURL(this.mediaSource);

      /** Functions binding */
      this.updateBuffer = this.updateBuffer.bind(this);
      this.initWS = this.initWS.bind(this);
      this.closeWS = this.closeWS.bind(this);
      this.sourceBufferHandle = this.sourceBufferHandle.bind(this);
      this.play = this.play.bind(this);
      this.stop = this.stop.bind(this);
      
    }

    updateBuffer() {
        if (this.queue.length > 0 && !this.buffer.updating) {
            this.buffer.appendBuffer(this.queue.shift());
        }
    }

    initWS(uid) {
      console.log('initialising web socket for - ' + uid);
      var _this = this;
      this.ws = new WebSocket('ws://' + window.location.hostname + ':' + 
              window.location.port + '/channel/'+uid, 'echo-protocol');
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = function(){
          console.info('WebSocket connection initialized');
      };

      this.ws.onmessage = function (event) {
          console.info('Recived WS message.', event);

          if(typeof event.data === 'object'){
              if (_this.buffer.updating || _this.queue.length > 0) {
                  console.info('Pushing to queue.');
                  _this.queue.push(event.data);
              } else {
                  console.info('Appending to buffer.');
                  _this.buffer.appendBuffer(event.data);
                  _this.audio.play();
              }
          }
      };
      this.ws.onclose = function(){ console.info('WebSocket connection closed') }
    }

    closeWS()
    {
        this.ws.close();
    }
    
    sourceBufferHandle(uid) {
        console.log("Handling source buffer" + this.currentUid);
        console.log("Handling source buffer - input UID: " + uid);
        this.buffer = this.mediaSource.addSourceBuffer(this.codecString);
        this.buffer.mode = 'sequence';

        console.log('adding sourceBufferHandle');
        var _this = this
        this.buffer.addEventListener('update', function() { // Note: Have tried 'updateend'
            console.log('update');
            _this.updateBuffer();
        });

        this.buffer.addEventListener('updateend', function() {
            console.log('updateend');
            _this.updateBuffer();
        });

        this.initWS(this.currentUid);
    }

    play (uid) {
      console.log("Opening stream: "+uid);
      this.currentUid = uid;
      this.mediaSource.addEventListener('sourceopen', this.sourceBufferHandle(uid));
      console.log("Source open listener added");
//      this.audio = new window.Audio(`/${uid}`);
//      this.audio.play();
    }

    stop () {
      
      this.closeWS();
//      this.audio.src = '';
//      this.audio.pause();
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

