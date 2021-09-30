/* eslint-disable */

let audioContext;
let analyserNode;
let analyserData;
let analyserTarget;
let isFloat = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

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
    const audio = document.createElement("audio");

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

    const fps = 12;
    setInterval(() => {
      if (isFloat) {
        analyserNode.getFloatTimeDomainData(analyserTarget);
      } else {
        analyserNode.getByteTimeDomainData(analyserTarget);
      }
    }, (1 / fps) * 1000);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function damp(a, b, lambda, dt) {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

function draw() {
  // fill background
  background(0, 0, 0);

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

    beginShape();
    const margin = 0.25;

    for (let i = 0; i < analyserData.length; i++) {
      const x = map(
        i,
        0,
        analyserData.length,
        width * margin,
        width * (1 - margin)
      );

      const signal = analyserData[i];

      // Some waveforms may have a low signal (quiet)
      // You can boost it like so
      const amplitude = height * 4;

      // map signal to pixel position
      const y = map(
        signal,
        -1,
        1,
        height / 2 - amplitude / 2,
        height / 2 + amplitude / 2
      );
      vertex(x, y);
    }

    endShape();
  } else {
    fill("white");
    noStroke();
    textAlign(CENTER, CENTER);
    textFont("monospace");
    text("click to play", width / 2, height / 2);
  }
}
