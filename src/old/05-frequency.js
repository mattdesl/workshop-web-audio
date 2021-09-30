/* eslint-disable */

let audioContext;
let frequencyData;
let analyserNode;
let currentHue = 0;
let maxFrequencyTarget = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Only initiate audio upon a user gesture
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    // Make a stream source, i.e. MP3, microphone, etc
    // In this case we choose an <audio> element
    const audio = document.createElement("audio");

    // Optional:
    // If the user inserts/removes bluetooth headphones or pushes
    // the play/pause media keys, we can use the following to ignore the action
    // navigator.mediaSession.setActionHandler("pause", () => {});

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

    // Enable looping
    audio.loop = true;

    // Set source
    audio.src = "audio/piano.mp3";

    // Connect source into the WebAudio context
    const source = audioContext.createMediaElementSource(audio);
    source.connect(audioContext.destination);

    analyserNode = audioContext.createAnalyser();

    const detail = 4;
    analyserNode.fftSize = 2048 * detail;

    analyserNode.minDecibels = -100;
    analyserNode.maxDecibels = -50;
    frequencyData = new Float32Array(analyserNode.frequencyBinCount);

    source.connect(analyserNode);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function dbToGain(db) {
  return Math.pow(10, db / 20);
}

function gainToDb(gain) {
  return 20 * (Math.log(gain) / Math.LN10);
}

function audioSignal(analyser, frequencies) {
  // if (!analyser) return 0;
  let rms = 0;
  for (let i = 0; i < frequencies.length; i++) {
    rms += frequencies[i] * frequencies[i];
  }
  rms = Math.sqrt(rms / frequencies.length);
  return dbToGain(rms);
  // rms /= frequencies.length;
  // rms = Math.sqrt(rms);
  // return rms;
  // // const minDb = analyserNode.minDecibels;
  // // const maxDb = analyserNode.maxDecibels;
  // // const valueDb = count === 0 || !isFinite(sum) ? minDb : sum / count;
  // // return map(valueDb, minDb, maxDb, 0, 1, true);
}

function draw() {
  // fill background
  background(240);
  noStroke();

  rectMode(CENTER);

  if (analyserNode) {
    analyserNode.getFloatFrequencyData(frequencyData);
  } else {
    // Instructions
    textAlign(CENTER, CENTER);
    textFont("monospace");
    fill("black");
    text("click to play", width / 2, height - height * 0.05);
  }
}
