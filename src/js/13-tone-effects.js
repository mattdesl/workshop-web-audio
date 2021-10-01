// The setup() function is async
// So it might take a little while to load
let ready = false;

// The synth that plays notes
let synth;

// Can be 'sine', 'sawtooth', 'triangle', 'square'
// Can also add suffixes like sine8, square4
const type = "square";

// Global volume in decibels
const volume = -15;

// The filter and effect nodes which we will modulate
let filter, effect;

// Min and max frequency (Hz) cutoff range for the filter
const filterMin = 100;
const filterMax = 5000;

// 0..1 values for our FX
let fxU = 0.5;
let fxV = 0.5;

// The notes we will use
const notes = ["C5", "A3", "D4", "G4", "A4", "F4"];

// Create a new canvas to the browser size
async function setup() {
  createCanvas(windowWidth, windowHeight);

  // Clear with black on setup
  background(0);

  // Make the volume quieter
  Tone.Master.volume.value = volume;

  // Setup a reverb with ToneJS
  const reverb = new Tone.Reverb({
    decay: 5,
    wet: 0.5,
    preDelay: 0.2,
  });

  // Load the reverb
  await reverb.generate();

  // Create an effect node that creates a feedback delay
  effect = new Tone.FeedbackDelay(0.4, 0.85);

  // Create a new filter for the X slider
  filter = new Tone.Filter();
  filter.type = "lowpass";

  // Setup a synth with ToneJS
  synth = new Tone.Synth({
    oscillator: {
      // We prefix 'fat' so we can spread the oscillator over multiple frequencies
      type: `fat${type}`,
      count: 3,
      spread: 30,
    },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.5,
      release: 0.1,
      attackCurve: "exponential",
    },
  });

  // Now lets wire up our stack like so:
  // synth->effect->reverb->filter->master
  synth.connect(effect);
  effect.connect(reverb);
  reverb.connect(filter);
  filter.connect(Tone.Master);

  // Now we're ready for drawing!
  ready = true;
}

// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Clear to black on resize
  background(0);
}

// Render loop that draws shapes with p5
function draw() {
  // Make sure async setup() is done before we draw
  if (!ready) return;

  filter.frequency.value = lerp(filterMin, filterMax, fxU);
  effect.wet.value = fxV;

  // For consistent sizing regardless of portrait/landscape
  const dim = Math.min(width, height);

  // Black background
  background(0, 0, 0, 20);

  // draw the two FX knobs
  if (mouseIsPressed) {
    noFill();
    strokeWeight(dim * 0.0175);
    stroke(255);
    drawEffectKnob(dim * 0.4, fxU);
    drawEffectKnob(dim * 0.6, fxV);
  }

  // Draw a 'play' button
  noStroke();
  fill(255);
  polygon(width / 2, height / 2, dim * 0.1, 3);
}

// Draws an arc with the given amount of 'strength'
function drawEffectKnob(radius, t) {
  if (t <= 0) return;
  arc(width / 2, height / 2, radius, radius, 0, PI * 2 * t);
}

// Update FX values based on mouse position
function updateEffects() {
  fxU = max(0, min(1, mouseX / width));
  fxV = max(0, min(1, mouseY / height));
}

// Update the FX and trigger synth ON
function mousePressed() {
  updateEffects();
  if (synth) synth.triggerAttack(random(notes));
}

// Update the FX values
function mouseDragged() {
  updateEffects();
}

// Trigger synth OFF
function mouseReleased() {
  if (synth) synth.triggerRelease();
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
