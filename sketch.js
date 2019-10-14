let modelIsReady = false;
// Create a new Sentiment method
const sentiment = ml5.sentiment("movieReviews", modelReady);

// When the model is loaded
function modelReady() {
  // model is ready
  console.log("Model Loaded!");
  modelIsReady = true;
}

let entireSentences;
let showingSentences = [];

let sentenceIndex;

let basicHue, basicSaturation, basicBrightness;

let socket = null;

function getSocket() {
  return socket;
}

function initSocket() {
  const { events } = window;
  socket = aSocket;
  //socket.on(events.getSentimentScore, sendScore);
}

function preload() {
  entireSentences = loadStrings("assets/alicewonder.txt");
  socket = io("http://localhost:4000/");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
  textSize(150);
  textAlign(RIGHT);

  sentenceIndex = 0;

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
    textSize(this.fontSize);
    const sentenceLength = textWidth(sentence);
    this.score = score;
    this.saturation = floor(basicSaturation * score);
    this.brightness = floor(
      basicBrightness - (basicSaturation - this.saturation)
    );
    this.posX = width + sentenceLength;
    this.posY = floor(random(100, height));
    this.expired = false;
  }

  decreasePosX() {
    if (this.posX > 0) {
      this.posX -= 5;
    } else {
      this.expired = true;
    }
  }
}

function readSentence() {
  if (modelIsReady) {
    const currentSentence = entireSentences[sentenceIndex];

    const prediction = sentiment.predict(currentSentence);
    const score = prediction.score;

    getSocket().emit("getSentimentScore", score);

    showingSentences.push(new Sentence(sentenceIndex, currentSentence, score));
    sentenceIndex++;
  }
}

function draw() {
  background(255);

  if (showingSentences.length > 0) {
    showingSentences.map(sentence => {
      if (!sentence.expired) {
        textSize(sentence.fontSize);
        fill(basicHue, sentence.saturation, sentence.brightness);
        text(sentence.sentence, sentence.posX, sentence.posY);
        sentence.decreasePosX();
      }
    });
    showingSentences = showingSentences.filter(sentence => !sentence.expired);
  }
}
