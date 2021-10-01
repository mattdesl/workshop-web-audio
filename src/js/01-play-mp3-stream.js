let audioContext;
let audio;

function mousePressed() {
  if (!audioContext) {
    // setup our audio
    audioContext = new AudioContext();

    // create new <audio> tag
    audio = document.createElement("audio");

    // optional; enable audio looping
    audio.loop = true;

    // set the URL of the audio asset
    audio.src = "audio/piano.mp3";

    // trigger audio
    audio.play();

    const source = audioContext.createMediaElementSource(audio);

    // wire the source to the 'speaker'
    source.connect(audioContext.destination);
  } else {
    // stop the audio
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
