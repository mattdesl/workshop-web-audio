// Master volume in decibels
const volume = -15;

// The synth we'll use for audio
let synth;

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
}

// Render loop that draws shapes with p5
function draw() {
  const dim = Math.min(width, height);

  // Black background
  background(0);

  // Get a 0..1 value for the mouse
  const u = max(0, min(1, mouseX / width));

  // Choose a frequency that sounds good
  const frequency = lerp(75, 2500, u);
  synth.setNote(frequency);

  if (mouseIsPressed) {
    const time = millis() / 1000;

    const verts = 1000;
    noFill();
    stroke(255);
    strokeWeight(dim * 0.005);
    beginShape();
    for (let i = 0; i < verts; i++) {
      const t = verts <= 1 ? 0.5 : i / (verts - 1);
      const x = t * width;
      let y = height / 2;

      // This is not an accurate representation, but
      // instead exaggerated for the sake of visualization
      const frequencyMod = lerp(1, 1000, pow(u, 5));
      const amplitude = sin(time + t * frequencyMod);

      y += (amplitude * height) / 2;

      vertex(x, y);
    }
    endShape();
  }

  // Draw a 'play' button
  noStroke();
  fill(255);
  polygon(width / 2, height / 2, dim * 0.1, 3);
}

// Update the FX and trigger synth ON
function mousePressed() {
  synth.triggerAttack();
}

// Trigger synth OFF
function mouseReleased() {
  synth.triggerRelease();
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
