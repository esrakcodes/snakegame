class Node {
  constructor(score) {
    this.score = score;
    this.next = null;
  }
}

class HighScoreLinkedList {
  constructor() {
    this.head = null;
  }

  addScore(score) {
    const newNode = new Node(score);
    if (!this.head || score > this.head.score) {
      newNode.next = this.head;
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next && score <= current.next.score) {
        current = current.next;
      }
      newNode.next = current.next;
      current.next = newNode;
    }
  }

  removeScore() {
    if (!this.head) return;
    this.head = this.head.next;
  }

  getHighScore() {
    return this.head ? this.head.score : 0;
  }
}

class SpeedLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
    this.multiplier = 100;
  }

  addSpeedIncrease(value) {
    const newNode = { value };
    if (!this.head) {
      this.head = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
    this.size++;
  }

  removeSpeedIncrease() {
    if (!this.head) return;
    this.head = this.head.next;
    this.size--;
  }

  getIntervalDuration() {
    return this.size > 0 ? this.multiplier / this.size : this.multiplier;
  }
}

let board = document.querySelector('#board');
let scoreElement = document.querySelector('#score');
let highScoreElement = document.querySelector('#highScore');
let restartPopup = document.getElementById('restartPopup');
let restartButton = document.getElementById('restartButton');

let snake = {};
let apple;
let score;
let updateInterval;
let SQUARE_SIZE = 4;
let ROWS = COLUMNS = 100 / SQUARE_SIZE;
let KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};
let xDown = null;
let yDown = null;

let highScores = new HighScoreLinkedList();
let speedList = new SpeedLinkedList();

document.querySelector('body').addEventListener('keydown', setNextDirection);
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);

init();
alert("Use your keyboard or swipe to control the snake.");

function init() {
  snake.body = [];
  snake.head = makeSnakeSquare(10, 10);
  snake.head.setAttribute('id', 'snake-head');
  apple = makeApple();
  scoreElement.innerHTML = "Score: 0";
  score = 0;
  calculateAndDisplayHighScore();
  updateInterval = setInterval(update, speedList.getIntervalDuration());
}

function update() {
  moveSnake();

  if (hasCollidedWithApple()) {
    handleAppleCollision();
  }

  if (hasCollidedWithSnake() || hasHitWall()) {
    endGame();
  }
}

function moveSnake() {
  for (let i = snake.body.length - 1; i >= 1; i--) {
    let snakeSquare = snake.body[i];
    let nextSnakeSquare = snake.body[i - 1];
    snakeSquare.direction = nextSnakeSquare.direction;
    repositionSquare(snakeSquare, nextSnakeSquare.row, nextSnakeSquare.column);
  }

  snake.head.direction = snake.head.nextDirection;
  if (snake.head.direction === "left") {
    snake.head.column--;
  } else if (snake.head.direction === "right") {
    snake.head.column++;
  } else if (snake.head.direction === "up") {
    snake.head.row--;
  } else if (snake.head.direction === "down") {
    snake.head.row++;
  }

  repositionSquare(snake.head, snake.head.row, snake.head.column);
}

function hasCollidedWithApple() {
  return snake.head.row === apple.row && snake.head.column === apple.column;
}

function handleAppleCollision() {
  score++;
  scoreElement.innerHTML = "Score: " + score;
  apple.remove();
  makeApple();
  let row = snake.tail.row;
  let column = snake.tail.column;
  if (snake.tail.direction === "left") {
    column++;
  } else if (snake.tail.direction === "right") {
    column--;
  } else if (snake.tail.direction === "up") {
    row++;
  } else if (snake.tail.direction === "down") {
    row--;
  }
  makeSnakeSquare(row, column);

  if (score === 4) {
    speedUp();
  }
}

function hasCollidedWithSnake() {
  for (let i = 1; i < snake.body.length; i++) {
    if (snake.head.row === snake.body[i].row && snake.head.column === snake.body[i].column) {
      return true;
    }
  }
}

function hasHitWall() {
  return snake.head.row > ROWS || snake.head.row < 1 || snake.head.column > COLUMNS || snake.head.column < 1;
}

function endGame() {
  clearInterval(updateInterval);
  removeAllChildElements(board);
  calculateAndDisplayHighScore();
  setTimeout(function () {
    init();
  }, 500);
}

function removeAllChildElements(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function makeSnakeSquare(row, column) {
  let snakeSquare = document.createElement('div');
  snakeSquare.setAttribute('class', 'snakeSquare');
  board.appendChild(snakeSquare);
  repositionSquare(snakeSquare, row, column);
  snake.body.push(snakeSquare);
  snake.tail = snakeSquare;
  return snakeSquare;
}

function repositionSquare(square, row, column) {
  square.row = row;
  square.column = column;
  const leftOffset = (column - 1) * SQUARE_SIZE + "%";
  const topOffset = (row - 1) * SQUARE_SIZE + "%";
  square.style.left = leftOffset;
  square.style.top = topOffset;
}

function makeApple() {
  apple = document.createElement('div');
  apple.setAttribute('id', 'apple');
  board.appendChild(apple);
  let randomPosition = getRandomAvailablePosition();
  repositionSquare(apple, randomPosition.row, randomPosition.column);
  return apple;
}

function getRandomAvailablePosition() {
  let spaceIsAvailable;
  let randomPosition = {};
  while (!spaceIsAvailable) {
    randomPosition.column = Math.ceil(Math.random() * COLUMNS);
    randomPosition.row = Math.ceil(Math.random() * ROWS);
    spaceIsAvailable = true;
    for (let i = 0; i < snake.body.length; i++) {
      let snakeSquare = snake.body[i];
      if (snakeSquare.row === randomPosition.row && snakeSquare.column === randomPosition.column) {
        spaceIsAvailable = false;
      }
    }
  }
  return randomPosition;
}

function setNextDirection(event) {
  let keyPressed = event.which;
  if (snake.head.direction !== "left" && snake.head.direction !== "right") {
    if (keyPressed === KEY.LEFT) {
      snake.head.nextDirection = "left";
    }
    if (keyPressed === KEY.RIGHT) {
      snake.head.nextDirection = "right";
    }
  }
  if (snake.head.direction !== "up" && snake.head.direction !== "down") {
    if (keyPressed === KEY.UP) {
      snake.head.nextDirection = "up";
    }
    if (keyPressed === KEY.DOWN) {
      snake.head.nextDirection = "down";
    }
  }
}

function calculateAndDisplayHighScore() {
  highScores.addScore(score);
  highScoreElement.textContent = "High Score: " + highScores.getHighScore();
}

function speedUp() {
  speedList.addSpeedIncrease(5);
  clearInterval(updateInterval);
  updateInterval = setInterval(update, speedList.getIntervalDuration());
}

function handleTouchStart(evt) {
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }
  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;
  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (snake.head.direction !== "left" && snake.head.direction !== "right") {
      snake.head.nextDirection = xDiff > 0 ? "left" : "right";
    }
  } else {
    if (snake.head.direction !== "up" && snake.head.direction !== "down") {
      snake.head.nextDirection = yDiff > 0 ? "up" : "down";
    }
  }
  xDown = null;
  yDown = null;
}
