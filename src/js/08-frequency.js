let audioContext;
let audio;
let analyserNode;
let frequencyData;

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

    analyserNode = audioContext.createAnalyser();

    // Get some higher resolution toward the low end
    analyserNode.fftSize = 2048 * 2;

    // These are the defaults but different tracks might
    // need different values
    analyserNode.minDecibels = -100;
    analyserNode.maxDecibels = -30;

    frequencyData = new Float32Array(analyserNode.fftSize);

    // Connect source to analyser node
    source.connect(analyserNode);

    // Connect the source to the destination (speakers/headphones)
    source.connect(audioContext.destination);
  } else {
    // Clean up our element and audio context
    audio.pause();
    audioContext.close();
    audioContext = audio = null;
  }
}

// Convert the frequency in Hz to an index in the array
function frequencyToIndex(frequencyHz, sampleRate, frequencyBinCount) {
  const nyquist = sampleRate / 2;
  const index = Math.round((frequencyHz / nyquist) * frequencyBinCount);
  return Math.min(frequencyBinCount, Math.max(0, index));
}

// Convert an index in a array to a frequency in Hz
function indexToFrequency(index, sampleRate, frequencyBinCount) {
  return (index * sampleRate) / (frequencyBinCount * 2);
}

// Get the normalized audio signal (0..1) between two frequencies
function audioSignal(analyser, frequencies, minHz, maxHz) {
  if (!analyser) return 0;
  const sampleRate = analyser.context.sampleRate;
  const binCount = analyser.frequencyBinCount;
  let start = frequencyToIndex(minHz, sampleRate, binCount);
  const end = frequencyToIndex(maxHz, sampleRate, binCount);
  const count = end - start;
  let sum = 0;
  for (; start < end; start++) {
    sum += frequencies[start];
  }

  const minDb = analyserNode.minDecibels;
  const maxDb = analyserNode.maxDecibels;
  const valueDb = count === 0 || !isFinite(sum) ? minDb : sum / count;
  return map(valueDb, minDb, maxDb, 0, 1, true);
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
  if (audioContext) {
    analyserNode.getFloatFrequencyData(frequencyData);

    const cx = width / 2;
    const cy = height / 2;
    const radius = dim * 0.75;
    strokeWeight(dim * 0.0075);

    noFill();

    // draw the low frequency signal
    stroke("#E84420");
    const drum = audioSignal(analyserNode, frequencyData, 150, 2500);
    circle(cx, cy, radius * drum);

    // draw the higher frequency signal
    stroke("#F4CD00");
    const voice = audioSignal(analyserNode, frequencyData, 50, 150);
    circle(cx, cy, radius * voice);
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
