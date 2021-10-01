// Master volume in decibels
const volume = -2;

// The synth we'll use for audio
let synth;

let mouse;

// Create a new canvas to the browser size
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Clear with black on setup
  background(0);

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
  synth.connect(Tone.Master);
}

// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Clear with black on resize
  background(0);
}

// Render loop that draws shapes with p5
function draw() {
  const dim = Math.min(width, height);

  // Instead of drawing black, we draw with
  // transparent black to give a 'ghosting' effect
  const opacity = 0.085;
  background(0, 0, 0, opacity * 255);

  // If we have a mouse position, draw it
  if (mouse) {
    noFill();
    stroke(255);
    strokeWeight(dim * 0.01);
    circle(mouse[0], mouse[1], dim * 0.2);

    // Clear position so we stop drawing it,
    // this will make it fade away
    mouse = null;
  }

  // Draw a 'play' button
  noStroke();
  fill(255);
  polygon(width / 2, height / 2, dim * 0.1, 3);
}

// Update mouse position and play a sound
function mousePressed() {
  // Store mouse position when pressed
  mouse = [mouseX, mouseY];

  // Hirajoshi scale in C
  // https://www.pianoscales.org/hirajoshi.html
  const notes = ["C", "Db", "F", "Gb", "Bb"];
  const octaves = [2, 3, 4];
  const octave = random(octaves);
  const note = random(notes);
  synth.triggerAttackRelease(note + octave, "8n");
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
