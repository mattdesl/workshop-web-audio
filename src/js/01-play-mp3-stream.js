let audioContext;
let audio;

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

    // Connect the source to the destination (speakers/headphones)
    source.connect(audioContext.destination);
  } else {
    // Clean up our element and audio context
    audio.pause();
    audioContext.close();
    audioContext = audio = null;
  }
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
    polygon(width / 2, height / 2, dim * 0.1, 4, PI / 4);
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
