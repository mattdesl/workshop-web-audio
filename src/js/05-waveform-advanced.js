/* eslint-disable */

let audioContext;
let analyserNode;
let analyserData;
let gainNode;
let audio;
let isFloat = false;
let interval;

function mousePressed() {
  // Only initiate audio upon a user gesture
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    // Optional:
    // If the user inserts/removes bluetooth headphones or pushes
    // the play/pause media keys, we can use the following to ignore the action
    // navigator.mediaSession.setActionHandler("pause", () => {});

    // Make a stream source, i.e. MP3, microphone, etc
    // In this case we choose an <audio> element
    audio = document.createElement("audio");

    // Upon loading the audio, let's play it
    audio.addEventListener(
      "canplay",
      () => {
        // First, ensure the context is in a resumed state
        audioContext.resume();
        // Now, play the audio
        audio.play();
      },
      { once: true }
    );

    // Loop audio
    audio.loop = true;

    // Set source
    audio.crossOrigin = "Anonymous";
    audio.src = "audio/piano.mp3";

    // Connect source into the WebAudio context
    const source = audioContext.createMediaElementSource(audio);
    source.connect(audioContext.destination);

    analyserNode = audioContext.createAnalyser();

    // You can increase the detail to some power-of-two value
    // This will give you more samples of data per second
    const detail = 4;
    analyserNode.fftSize = 2048 * detail;

    isFloat = Boolean(analyserNode.getFloatTimeDomainData);
    analyserData = new Float32Array(analyserNode.fftSize);
    if (isFloat) {
      // We can use float array for this, for higher detail
      analyserTarget = new Float32Array(analyserData.length);
    } else {
      // We are stuck with byte array
      analyserTarget = new Uint8Array(analyserData.length);
      analyserTarget.fill(0xff / 2);
    }

    // connect source to analyser
    source.connect(analyserNode);

    // Only update the data every N fps
    const fps = 12;
    interval = setInterval(() => {
      if (isFloat) {
        analyserNode.getFloatTimeDomainData(analyserTarget);
      } else {
        analyserNode.getByteTimeDomainData(analyserTarget);
      }
    }, (1 / fps) * 1000);
  } else {
    // kill audio
    audio.pause();
    audioContext.close();
    clearInterval(interval);
    audioContext = analyserNode = null;
  }
}

// Smooth linear interpolation that accounts for delta time
function damp(a, b, lambda, dt) {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // fill background
  background(0, 0, 0);

  fill("white");
  noStroke();
  if (analyserNode) {
    // Interpolate the previous frame's data to the new frame
    for (let i = 0; i < analyserData.length; i++) {
      analyserData[i] = damp(
        analyserData[i],
        isFloat ? analyserTarget[i] : (analyserTarget[i] / 256) * 2 - 1,
        0.01,
        deltaTime
      );
    }

    // draw your scene
    noFill();
    stroke("white");

    // draw each sample within the data
    beginShape();
    const margin = 0.1;

    for (let i = 0; i < analyserData.length; i++) {
      // Map sample to screen X position
      const x = map(
        i,
        0,
        analyserData.length,
        width * margin,
        width * (1 - margin)
      );

      // Signal coming from this frequency bin
      const signal = analyserData[i];

      // Boost the signal a little so it shows better
      const amplitude = height * 4;

      // Map signal to screen Y position
      const y = map(
        signal,
        -1,
        1,
        height / 2 - amplitude / 2,
        height / 2 + amplitude / 2
      );

      // Place vertex
      vertex(x, y);
    }

    // Finish the line
    endShape();
  } else {
    // Draw a play button
    const dim = min(width, height);
    polygon(width / 2, height / 2, dim * 0.1, 3);
  }
}

// Draw a basic polygon, handles triangles, squares, pentagons, etc
function polygon(x, y, radius, sides = 3, angle = 0) {
  beginShape();
  for (let i = 0; i < sides; i++) {
    const a = angle + TWO_PI * (i / sides);
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}
