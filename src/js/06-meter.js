let audioContext;
let audio;
let signalData;
let analyserNode;

function mousePressed() {
  if (!audioContext) {
    // Create a new audio context
    audioContext = new AudioContext();

    // Create <audio> tag
    audio = document.createElement("audio");

    // set URL to the MP3 within your Glitch.com assets
    audio.src = "audio/piano.mp3";

    // To play audio through Glitch.com CDN
    audio.crossOrigin = "Anonymous";

    // Enable looping so the audio never stops
    audio.loop = true;

    // Play audio
    audio.play();

    // Create a "Media Element" source node
    const source = audioContext.createMediaElementSource(audio);

    // Create an analyser
    analyserNode = audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 1;

    // Create FFT data
    signalData = new Float32Array(analyserNode.fftSize);

    // Connect the source to the destination (speakers/headphones)
    source.connect(audioContext.destination);

    // Connect the source to the analyser node as well
    source.connect(analyserNode);
  } else {
    // Clean up our element and audio context
    if (audio.paused) audio.play();
    else audio.pause();
  }
}

// Get the root mean squared of a set of signals
function rootMeanSquaredSignal(data) {
  let rms = 0;
  for (let i = 0; i < data.length; i++) {
    rms += data[i] * data[i];
  }
  return Math.sqrt(rms / data.length);
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

  // Draw play/pause button
  const dim = min(width, height);
  if (audioContext) {
    // Get the *time domain* data (not the frequency)
    analyserNode.getFloatTimeDomainData(signalData);

    // Get the root mean square of the data
    const signal = rootMeanSquaredSignal(signalData);
    const scale = 10; // scale the data a bit so the circle is bigger
    const size = dim * scale * signal;

    stroke("white");
    noFill();
    strokeWeight(dim * 0.0075);
    circle(width / 2, height / 2, size);
  } else {
    fill("white");
    noStroke();
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
