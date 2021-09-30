/* eslint-disable */

let audioContext;
let audioBuffer;

function setup() {
  createCanvas(windowWidth, windowHeight);
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
}

async function playSound() {
  // ensure we are all loaded up
  await loadSound();

  // ensure we are in a resumed state
  await audioContext.resume();

  // now trigger the audio
  const source = audioContext.createBufferSource();
  source.connect(audioContext.destination);
  source.buffer = audioBuffer;
  source.start(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // fill background
  background("black");

  // Instructions
  fill("white");
  noStroke();
  textAlign(CENTER, CENTER);
  textFont("monospace");
  text("click to play", width / 2, height / 2);
}
