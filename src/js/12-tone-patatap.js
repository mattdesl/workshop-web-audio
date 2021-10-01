// Master volume in decibels
const volume = -2;

// The synth we'll use for audio
let synth;

let risoColors;
let colorJSON;
let active = false;

function preload() {
  // loads a JSON as an object
  colorJSON = loadJSON("js/riso-colors.json");
}

// Create a new canvas to the browser size
function setup() {
  createCanvas(windowWidth, windowHeight);
  background("black");

  // unpack the JSON object as an array
  risoColors = Object.values(colorJSON);

  // Make the volume quieter
  Tone.Master.volume.value = volume;

  // Setup a synth with ToneJS
  synth = new Tone.Synth({
    oscillator: {
      type: "sine",
    },
  });

  // Wire up our nodes:
  // synth->master

  var feedbackDelay = new Tone.FeedbackDelay("8n", 0.6);
  synth.connect(feedbackDelay);
  synth.connect(Tone.Master);
  feedbackDelay.connect(Tone.Master);

  frameRate(25);
}

// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Render loop that draws shapes with p5
function draw() {
  // We slowly clear each frame
  const opacity = 0.05;
  background(0, 0, 0, opacity * 255);

  if (!active) {
    const dim = min(width, height);
    noStroke();
    fill(255);
    polygon(width / 2, height / 2, dim * 0.05, 3);
  }
}

// Update mouse position and play a sound
function mousePressed() {
  // First time we click...
  if (!active) {
    active = true;
    // Clear background to white to create an initial flash
    background(255);
  }

  // choose a note
  const note = random(["A3", "C4", "D4", "E3", "G4"]);
  synth.triggerAttackRelease(note, "8n");

  const dim = min(width, height);
  const x = mouseX;
  const y = mouseY;

  noStroke();
  const curColorData = random(risoColors);
  const curColor = color(curColorData.hex);
  const size = max(10, abs(randomGaussian(dim / 8, dim / 8)));
  const type = random(["circle", "line", "polygon"]);
  curColor.setAlpha(255 * 0.25);
  background(curColor);
  curColor.setAlpha(255);

  fill(curColor);
  textAlign(CENTER, CENTER);
  textFont("monospace");
  text(curColorData.pantone, x, y + size / 2 + 20);
  text(curColorData.name, x, y - size / 2 - 20);
  if (type === "circle") {
    ellipseMode(CENTER);
    circle(x, y, size);
  } else if (type === "line") {
    strokeWeight(dim * 0.01);
    stroke(curColor);
    polygon(x, y, size * 0.5, 2, random(-1, 1) * PI * 2);
  } else if (type === "polygon") {
    polygon(x, y, size * 0.5, floor(random(3, 10)), random(-1, 1) * PI * 2);
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
