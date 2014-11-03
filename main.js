var canvas;
var video;
var display;
var temp_display;
var frames = [];
var frame;
var ind;

var vid_width = 640;
var vid_height = 480;
var can_width = 64*2;
var can_height = 48*2;
var frame_width = can_width;
var frame_height = can_height;
var NUM_FRAMES = frame_width;

var init_canvas = function() {
  video = document.querySelector('video');
  canvas = document.createElement('canvas'); // offscreen video capture canvas.
  display = document.querySelector('#display');
  temp_display = document.querySelector('#temp-display');
  canvas.width = can_width;
  canvas.height = can_height;
  temp_display.width = can_width;
  temp_display.height = can_height;
  //display.width = vid_width;
  //display.height = vid_height;
  display.width = document.body.clientWidth;
  display.height = document.body.clientHeight;
  init_frames();
}

var init_frames = function() {
  ind = 0;
  frame = new Uint8ClampedArray(frame_width*frame_height);
  for(var i = 0; i < NUM_FRAMES; i++) {
    frames.push(frame);
  }
}

var hasGetUserMedia = function() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia);
}
var errorCallback = function(err) {
  console.log('error: ', err);
}
var successCallback = function(stream) {
  console.log('success');
  video.src = window.URL.createObjectURL(stream);
  requestAnimationFrame(go);
}

var mod = function(n, m) {
  return ((n%m)+m)%m;
}
var gf = function(r, c) {
  return r * (frame_width*4) + c*4;
}
var go = function() {
  requestAnimationFrame(go);
  var ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, can_width, can_height);
  var d = ctx.getImageData(0, 0, can_width, can_height).data;
  // Circular buffer
  frames[mod(ind++, NUM_FRAMES)] = d;
  draw_frame(frame, frames);
}

var draw_frame = function(frame, frames) {
  var width = frame_width;
  var height = frame_height;

  var temp_ctx = temp_display.getContext('2d');
  var ctx = display.getContext('2d');
  var _frame = temp_ctx.createImageData(frame_width, frame_height);

  for(var c = 0; c < width; c++) {
    for(var r = 0; r < height; r++) {
      var cf = frames[mod(ind-c, NUM_FRAMES)];
      var i = gf(r,c);
      _frame.data[i + 0] = cf[i + 0];
      _frame.data[i + 1] = cf[i + 1];
      _frame.data[i + 2] = cf[i + 2];
      _frame.data[i + 3] = cf[i + 3];
    }
  }
  temp_ctx.putImageData(_frame, 0, 0);
  ctx.drawImage(temp_display, 0, 0, display.width, display.height);
}

var init = function() {
  init_canvas();

  navigator.getUserMedia  = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  if (hasGetUserMedia()) {
    // successCallback does the rest
    navigator.getUserMedia(
        { video: { mandatory: { maxWidth: 640 , maxHeight: 480 } } }
        , successCallback , errorCallback);
  } else {
    errorCallback('getusermedia not supported');
  }
}
init();
