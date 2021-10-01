// Master volume in decior audio
let synth;

// Whether the audio sequence is playing
let playing = false;

// The current Tone.Sequence
let sequence;

// The currently playing column
let currentColumn = 0;

// Here is the fixed scale we will use
const notes = ["A3", "C4", "D4", "E3", "G4"];

// Also can try other scales/notes
// const notes = ["F#4", "E4", "C#4", "A4"];
// const notes = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'];
// const notes = [ "A4", "D3", "E3", "G4", 'F#4' ];

// Number of rows is the number of different notes
const numRows = notes.length;

// Number of columns is depending on how many notes to play in a measure
const numCols = 16;
const noteInterval = `${numCols}n`;

// Setup audio config
Tone.Transport.bpm.value = 120;

// Create a Row*Col data structure that has nested arrays
// [ [ 0, 0, 0 ], [ 0, 0, 0 ], ... ]
// The data can be 0 (off) or 1 (on)
const data = [];
for (let y = 0; y < numRows; y++) {
  const row = [];
  for (let x = 0; x < numCols; x++) {
    row.push(0);
  }
  data.push(row);
}

// Create a new canvas to the browser size
async function setup() {
  // Setup canvas size as a square
  const dim = min(windowWidth, windowHeight);
  createCanvas(innerWidth, innerHeight);

  // Clear with black on setup
  background(0);

  // Setup a reverb with ToneJS
  const reverb = new Tone.Reverb({
    decay: 4,
    wet: 0.2,
    preDelay: 0.25,
  });

  // Load the reverb
  await reverb.generate();

  // Create an effect node that creates a feedback delay
  const effect = new Tone.FeedbackDelay(`${Math.floor(numCols / 2)}n`, 1 / 3);
  effect.wet.value = 0.2;

  // Setup a synth with ToneJS
  // We use a poly synth which can hold up to numRows voices
  // Then we will play each note on a different voice
  synth = new Tone.PolySynth(numRows, Tone.DuoSynth);

  // Setup the synths a little bit
  synth.set({
    voice0: {
      oscillator: {
        type: "triangle4",
      },
      volume: -30,
      envelope: {
        attack: 0.005,
        release: 0.05,
        sustain: 1,
      },
    },
    voice1: {
      volume: -10,
      envelope: {
        attack: 0.005,
        release: 0.05,
        sustain: 1,
      },
    },
  });
  synth.volume.value = -10;

  // Wire up our nodes:
  synth.connect(effect);
  synth.connect(Tone.Master);
  effect.connect(reverb);
  reverb.connect(Tone.Master);

  // Every two measures, we randomize the notes
  // We use Transport to schedule timer since it has
  // to be exactly in sync with the audio
  Tone.Transport.scheduleRepeat(() => {
    randomizeSequencer();
  }, "2m");
}

// On window resize, update the canvas size
function windowResized() {
  // const dim = max(windowWidth, windowHeight);
  resizeCanvas(innerWidth, innerHeight);
}

// Render loop that draws shapes with p5
function draw() {
  // Our synth isn't loaded yet, don't draw anything
  if (!synth) return;

  const dim = min(width, height);

  // Black background
  background(0);

  if (playing) {
    // The audio is playing so we can show the sequencer
    const margin = dim * 0.2;
    const innerSize = dim - margin * 2;
    const cellSize = innerSize / numCols;
    push();
    translate(innerWidth / 2 - dim / 2, innerHeight / 2 - dim / 2);
    // Loop through the nested data structure, drawing each note
    for (let y = 0; y < data.length; y++) {
      const row = data[y];
      for (let x = 0; x < row.length; x++) {
        const u = x / (numCols - 1);
        const v = y / (numRows - 1);
        let px = lerp(margin, dim - margin, u);
        let py = lerp(margin, dim - margin, v);

        noStroke();
        noFill();

        // note on=fill, note off=stroke
        if (row[x] === 1) fill(255);
        else stroke(255);

        // draw note
        circle(px, py, cellSize / 2);

        // draw a rectangle around the currently playing column
        if (x === currentColumn) {
          rectMode(CENTER);
          rect(px, py, cellSize, cellSize);
        }
      }
    }
    pop();
  } else {
    // Draw a 'play' button
    noStroke();
    fill(255);
    polygon(width / 2, height / 2, dim * 0.1, 3);
  }
}

// Here we randomize the sequencer with some data
function randomizeSequencer() {
  // Choose a % chance so that sometimes it is more busy, other times more sparse
  const chance = random(0.5, 1.5);
  for (let y = 0; y < data.length; y++) {
    // Loop through and create some random on/off values
    const row = data[y];
    for (let x = 0; x < row.length; x++) {
      row[x] = randomGaussian() > chance ? 1 : 0;
    }
    // Loop through again and make sure we don't have two
    // consectutive on values (it sounds bad)
    for (let x = 0; x < row.length - 1; x++) {
      if (row[x] === 1 && row[x + 1] === 1) {
        row[x + 1] = 0;
        x++;
      }
    }
  }
}

// When the mouse is pressed, turn on the sequencer
function mousePressed() {
  // No synth loaded yet, just skip mouse click
  if (!synth) {
    return;
  }

  if (playing) {
    // If we are currently playing, we stop the sequencer
    playing = false;
    sequence.stop();
    Tone.Transport.stop();
  } else {
    // If we aren't currently playing, we can start the sequence

    // We do this by creating an array of indices [ 0, 1, 2 ... 15 ]
    const noteIndices = newArray(numCols);
    // create the sequence, passing onSequenceStep function
    sequence = new Tone.Sequence(onSequenceStep, noteIndices, noteInterval);

    // Start the sequence and Transport loop
    playing = true;
    sequence.start();
    Tone.Transport.start();
  }
}

// Here is where we actually play the audi
function onSequenceStep(time, column) {
  // We build up a list of notes, which will equal
  // the numRows. This gets passed into our PolySynth
  let notesToPlay = [];

  // Go through each row
  data.forEach((row, rowIndex) => {
    // See if the note is "on"
    const isOn = row[column] == 1;
    // If its on, add it to the list of notes to play
    if (isOn) {
      const note = notes[rowIndex];
      notesToPlay.push(note);
    }
  });

  // Trigger a note
  const velocity = random(0.5, 1);
  synth.triggerAttackRelease(notesToPlay, noteInterval, time, velocity);
  Tone.Draw.schedule(function () {
    currentColumn = column;
  }, time);
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

// A utility function to create a new array
// full of indices [ 0, 1, 2, ... (N - 1) ]
function newArray(n) {
  const array = [];
  for (let i = 0; i < n; i++) {
    array.push(i);
  }
  return array;
}
