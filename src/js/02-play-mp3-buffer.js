/* eslint-disable */

let audioContext;
let audioBuffer;

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
    const resp = await fetch("audio/chime.mp3");

    // Turn into an array buffer of raw binary data
    const buf = await resp.arrayBuffer();

    // Decode the entire binary MP3 into an AudioBuffer
    audioBuffer = await audioContext.decodeAudioData(buf);
  }
}

async function playSound() {
  // Ensure we are all loaded up
  await loadSound();

  // Ensure we are in a resumed state
  await audioContext.resume();

  // Now create a new "Buffer Source" node for playing AudioBuffers
  const source = audioContext.createBufferSource();

  // Connect to destination
  source.connect(audioContext.destination);

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
  background("black");

  fill("white");
  noStroke();

  // Draw play/pause button
  const dim = min(width, height);
  if (mouseIsPressed) {
    circle(width / 2, height / 2, dim * 0.1);
  } else {
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
