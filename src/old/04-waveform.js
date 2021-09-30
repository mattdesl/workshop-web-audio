/* eslint-disable */

let audioContext;
let analyserNode;
let audioBuffer;
let analyserData;
let gainNode;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(10);
}

function mousePressed() {
  // Only initiate audio upon a user gesture
  playSound();
}

async function loadSound() {
  // Re-use the same context if it exists
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }

  // Re-use the audio buffer as a source
  if (!audioBuffer) {
    const resp = await fetch("audio/chime.mp3");
    const buf = await resp.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(buf);
  }

  if (!gainNode) {
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    analyserNode = audioContext.createAnalyser();
    analyserData = new Uint8Array(analyserNode.fftSize);

    gainNode.connect(analyserNode);
  }
}

async function playSound() {
  // ensure we are all loaded up
  await loadSound();

  // ensure we are in a resumed state
  await audioContext.resume();

  // now trigger the audio
  const source = audioContext.createBufferSource();
  source.connect(gainNode);
  source.buffer = audioBuffer;
  source.start(0);
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
    analyserNode.getByteTimeDomainData(analyserData);

    // draw your scene
    for (let i = 0; i < analyserData.length; i++) {
      const x = (i / analyserData.length) * width;
      const signal = (analyserData[i] / 256) * 2 - 1;

      // Some waveforms may have a low signal (quiet)
      // You can boost it like so
      const amplitude = (signal * height) / 2;

      rectMode(CENTER);
      rect(x, height / 2, 1, amplitude);
    }
  } else {
    textAlign(CENTER, CENTER);
    textFont("monospace");
    text("click to play", width / 2, height / 2);
  }
}
