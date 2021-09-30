#### <sup>:closed_book: [Web Audio Synthesis & Visualization](../README.md) → Snippets</sup>

---

# Snippets

Here you will find some 'recipes' and patterns that we'll be using during the workshop.

## Contents

- [Playing an Audio Tag](#creating-an-audio-tag)
- [Loading an Audio Buffer](#loading-an-audio-buffer)
- [Playing an Audio Buffer](#playing-an-audio-buffer)
- [Analysing Audio Waveform](#analysing-audio-waveform)
- [Analysing Audio Frequency](#analysing-audio-frequency)
- [Root Mean Squared Metering](#root-mean-squared-metering)
- [Indexing into the Frequency Array](#indexing-into-the-frequency-array)
- [Disabling Builtin Play/Pause Controls](#disabling-builtin-playpause-controls)

## Creating an Audio Tag

```js
// Create <audio> tag
const audio = document.createElement("audio");

// set URL to the MP3 within your Glitch.com assets
audio.src = "path/to/music.mp3";

// To play audio through Glitch.com CDN
audio.crossOrigin = "Anonymous";

// Optional: enable looping so the audio never stops
audio.loop = true;

// Play audio
audio.play();

// If it's not already playing, resume audio context
audioContext.resume();
```

## Loading an Audio Buffer

```js
let audioContext;
let audioBuffer;

async function loadSound() {
  // Re-use the same context if it exists
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Re-use the audio buffer as a source
  if (!audioBuffer) {
    // Fetch MP3 from URL
    const resp = await fetch("path/to/music.mp3");

    // Turn into an array buffer of raw binary data
    const buf = await resp.arrayBuffer();

    // Decode the entire binary MP3 into an AudioBuffer
    audioBuffer = await audioContext.decodeAudioData(buf);
  }
}
```

## Playing an Audio Buffer

This relies on the `loadSound` function just described previously, as you can only play an audio buffer once it's been loaded and decoded asynchronously.

```js
async function playSound() {
  // Ensure we are all loaded up
  await loadSound();

  // Ensure we are in a resumed state
  await audioContext.resume();

  // Now create a new "Buffer Source" node for playing AudioBuffers
  const source = audioContext.createBufferSource();

  // Connect to gain (which will be analyzed and also sent to destination)
  source.connect(audioContext.destination);

  // Assign the loaded buffer
  source.buffer = audioBuffer;

  // Start (zero = play immediately)
  source.start(0);
}
```

## Disabling Builtin Play/Pause Controls

Browsers, by default, will play/pause `<audio>` elements on keyboard controls, and also sometimes when you connect and disconnect bluetooth headphones. In many apps, you may want to override this.

```js
// just ignore this event
navigator.mediaSession.setActionHandler("pause", () => {});
```

## Analysing Audio Waveform

```js
let data;
let analyserNode;

function setupAudio() {
  /* ... create an audio 'source' node ... */

  analyserNode = audioContext.createAnalyser();
  signalData = new Float32Array(analyserNode.fftSize);

  source.connect(analyserNode);
}

function draw() {
  analyserNode.getFloatTimeDomainData(signalData);

  /* now visualize ... */
}
```

## Analysing Audio Frequency

```js
let data;
let frequencyData;

function setupAudio() {
  /* ... create an audio 'source' node ... */

  analyserNode = audioContext.createAnalyser();
  frequencyData = new Float32Array(analyserNode.frequencyBinCount);

  source.connect(analyserNode);
}

function draw() {
  analyserNode.getFloatFrequencyData(frequencyData);

  /* now visualize ... */
}
```

## Root Mean Squared Metering

Start with [Analysing Audio Waveform](#analysing-audio-waveform) snippet and then pass the data into the following function to get a signal between 0 and 1.

```js
function rootMeanSquaredSignal(data) {
  let rms = 0;
  for (let i = 0; i < data.length; i++) {
    rms += data[i] * data[i];
  }
  return Math.sqrt(rms / data.length);
}
```

## Indexing into the Frequency Array

If you have an array that represents a list of frequency bins (i.e. where the indices represent a frequency band in Hz and the array elements represent it's signal in Db) you can convert from Hz to an index and back like so:

```js
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
```

##

#### <sup>[← Back to Documentation](../README.md)
