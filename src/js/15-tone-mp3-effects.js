// Master volume in decibels
const volume = -16;

const MP3 = "audio/piano.mp3";

// The synth we'll use for audio
let player;

let autoFilter;

// Create a new canvas to the browser size
async function setup() {
  createCanvas(windowWidth, windowHeight);

  // Make the volume quieter
  Tone.Master.volume.value = volume;

  // We can use 'player' to play MP3 files
  player = new Tone.Player();
  player.loop = true;
  player.autostart = false;
  player.loopStart = 1.0;

  // Load and "await" the MP3 file
  await player.load(MP3);

  // Wire up connections
  autoFilter = new Tone.AutoFilter("8n");
  autoFilter.start();

  player.connect(autoFilter);
  autoFilter.connect(Tone.Master);
}

// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Render loop that draws shapes with p5
function draw() {
  if (!player || !player.loaded) {
    // MP3 not loaded
    return;
  }
  const dim = Math.min(width, height);

  // Black background
  background(0);

  autoFilter.wet.value = mouseY / height;
  autoFilter.frequency.value = map(mouseX, 0, width, 0.5, 1.5);

  // Draw a 'play' or 'stop' button
  if (player.state === "started") {
    noStroke();
    fill(255);
    polygon(width / 2, height / 2, dim * 0.1, 4, PI / 4);

    stroke("tomato");
    noFill();
    strokeWeight(dim * 0.0175);
    circle(mouseX, mouseY, dim * 0.2);
  } else {
    noStroke();
    fill(255);
    polygon(width / 2, height / 2, dim * 0.1, 3);
  }
}

// Update the FX and trigger synth ON
function mousePressed() {
  if (player && player.loaded) {
    if (player.state === "started") {
      player.stop();
    } else {
      player.start();
    }
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
