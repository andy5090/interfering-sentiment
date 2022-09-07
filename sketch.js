let modelIsReady = false;
const sentiment = ml5.sentiment("movieReviews", modelReady);

// When the model is loaded
function modelReady() {
  // model is ready
  console.log("Model Loaded!");
  modelIsReady = true;
}

const bookList = [
  "alice_in_wonderland.txt",
  "dracula.txt",
  "faust.txt",
  "mobydick.txt",
  "frankenstein.txt",
  "wizard_of_oz.txt",
  "anna_karenina.txt"
];
let entireSentences;
let showingSentences = [];

let sentenceIndex;

let basicHue, basicSaturation, basicBrightness;

let chosenBookId;
let textSizeForHeight = 0;

function preload() {
  chosenBookId = floor(random(0, 6));
  const chosenBookName = bookList[chosenBookId];
  entireSentences = loadStrings(`assets/${chosenBookName}`);
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  colorMode(HSB, 255);
  textSize(150);
  textAlign(RIGHT);

  sentenceIndex = 0;

  textSizeForHeight = height / 12;

  const basicColor = color("#eb3b5a");
  basicHue = hue(basicColor);
  basicSaturation = saturation(basicColor);
  basicBrightness = brightness(basicColor);

  setInterval(readSentence, 1000);
}

class Sentence {
  constructor(index, sentence, score) {
    this.originalIndex = index;
    this.sentence = sentence;
    this.fontSize = floor(random(100, 150));
    this.score = score;
    this.saturation = floor(basicSaturation * score);
    this.brightness = floor(
      basicBrightness - (basicSaturation - this.saturation)
    );
    const sentenceLength = textWidth(sentence);
    this.posX = width + sentenceLength;
    this.posY = floor(random(100, height));
    this.expired = false;
    this.osc = new p5.Oscillator(floor(score * 1000), "sine");
    this.isPlaying = false;
  }

  soundStart() {
    this.osc.amp(0.05);
    this.osc.start();
    this.isPlaying = true;
  }

  decreasePosX() {
    if (this.posX > 0) {
      this.posX -= 5;
    } else {
      this.osc.stop();
      this.expired = true;
    }
  }
}

function readSentence() {
  if (modelIsReady) {
    const currentSentence = entireSentences[sentenceIndex];

    const prediction = sentiment.predict(currentSentence);
    const score = prediction.score;

    showingSentences.push(new Sentence(sentenceIndex, currentSentence, score));
    sentenceIndex++;

    if (entireSentences.length === sentenceIndex) {
      const doneBookId = chosenBookId;
      while (chosenBookId !== doneBookId) {
        chosenBookId = floor(random(0, 6));
      }
      const chosenBookName = bookList[chosenBookId];
      entireSentences = loadStrings(`assets/${chosenBookName}`);
      sentenceIndex = 0;
    }
  }
}

function draw() {
  background(255);

  if (showingSentences.length > 0) {
    showingSentences.map(sentence => {
      textSize(textSizeForHeight);
      fill(100, 100, 100, 50);
      if (sentence.originalIndex % 24 > 12)
        text(
          sentence.score,
          width / 2,
          (sentence.originalIndex % 12) * textSizeForHeight
        );
      else
        text(
          sentence.score,
          width,
          (sentence.originalIndex % 12) * textSizeForHeight
        );

      if (!sentence.expired) {
        if (!sentence.isPlaying) {
          sentence.soundStart();
        }

        textSize(sentence.fontSize);
        fill(basicHue, sentence.saturation, sentence.brightness);
        text(sentence.sentence, sentence.posX, sentence.posY);
        sentence.decreasePosX();
      }
    });
    showingSentences = showingSentences.filter(sentence => !sentence.expired);
  }
}

function mouseClicked() {
  let fs = fullscreen();
  fullscreen(!fs);
}
