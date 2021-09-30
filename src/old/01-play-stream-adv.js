/* eslint-disable */

let audioContext;

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
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // fill background
  background("black");

  fill("white");
  noStroke();
  if (audioContext) {
    // Draw something as we play...
    circle(width / 2, height / 2, 50);
  } else {
    // Instructions
    textAlign(CENTER, CENTER);
    textFont("monospace");
    text("click to play", width / 2, height / 2);
  }
}
