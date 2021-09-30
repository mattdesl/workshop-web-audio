/* eslint-disable */

let audioContext;
let audioBuffer;
let analyserNode;
let analyserData;
let gainNode;

function mousePressed() {
  playSound();
}

async function loadSound() {
  // Re-use the same context if it exists
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Re-use the audio buffer as a source
  if (!audioBuffer) {
    // Fetch MP3 from URL
    const resp = await fetch(
      "https://cdn.glitch.com/efd607a8-13b8-4089-841b-f5c1a80c47e3%2Fchime.mp3?v=1632745141657"
    );

    // Turn into an array buffer of raw binary data
    const buf = await resp.arrayBuffer();

    // Decode the entire binary MP3 into an AudioBuffer
    audioBuffer = await audioContext.decodeAudioData(buf);
  }

  // Setup a master gain node and AnalyserNode
  if (!gainNode) {
    // Create a gain and connect to destination
    gainNode = audioContext.createGain();

    // Create an Analyser Node
    analyserNode = audioContext.createAnalyser();

    // Create a Float32 array to hold the data
    analyserData = new Float32Array(analyserNode.fftSize);

    // Connect the GainNode to the analyser
    gainNode.connect(analyserNode);

    // Connect GainNode to destination as well
    gainNode.connect(audioContext.destination);
  }
}

async function playSound() {
  // Snsure we are all loaded up
  await loadSound();

  // Snsure we are in a resumed state
  await audioContext.resume();

  // Now create a new "Buffer Source" node for playing AudioBuffers
  const source = audioContext.createBufferSource();

  // Connect to gain (which will be analyzed and also sent to destination)
  source.connect(gainNode);

  // Assign the loaded buffer
  source.buffer = audioBuffer;

  // Start (zero = play immediately)
  source.start(0);
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

  if (analyserNode) {
    noFill();
    stroke("white");

    // Get the new "Time Domain" data from the AnalyserNode
    analyserNode.getFloatTimeDomainData(analyserData);

    beginShape();
    // Loop through each 'bin' and figure out the signal
    for (let i = 0; i < analyserData.length; i++) {
      // The signal (-1..1 range) at this time slice
      const signal = analyserData[i];

      // X screen position to draw this rectangle
      const x = (i / analyserData.length) * width;

      // Determine Y position of sample, away from centre
      const size = height / 2;
      const y = map(signal, -1, 1, height / 2 - size, height / 2 + size);

      // Place sample
      vertex(x, y);
    }
    endShape();
  } else {
    fill("white");
    noStroke();
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
