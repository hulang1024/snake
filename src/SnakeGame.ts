import Dir from "./Dir";
import Game from "./Game";
import GameMap from "./GameMap";
import HealthBar from "./HealthBar";
import Rabbit from "./Rabbit";
import ScoreDisplay from "./ScoreDisplay";
import Snake from "./Snake";
import SpeedDisplay from "./SpeedDisplay";
import { SPRITE_SIZE } from "./sprite";
import { randomInt } from "./utils";
import { Key } from "./keyboard";

const DIR_KEYS_TABLE = [
  [Key.up, Key.w],
  [Key.right, Key.d],
  [Key.down, Key.s],
  [Key.left, Key.a]
];


export default class SnakeGame extends Game {
  public container: HTMLElement;

  private isOver: boolean = true;
  private isPause: boolean = true;

  private gameMap: GameMap;
  private snake: Snake;
  private rabbit: Rabbit;

  private speedDisplay: SpeedDisplay;
  private scoreDisplay: ScoreDisplay;
  private healthBar: HealthBar;

  private gameStartOverlay: HTMLElement;
  private gamePauseOverlay: HTMLElement;
  private gameOverOverlay: HTMLElement;

  constructor() {
    super();
    
    const mapWidth = Math.min(document.body.offsetWidth - 8, SPRITE_SIZE * 30);
    const mapHeight = Math.min(document.body.offsetHeight - 60, SPRITE_SIZE * 24);
    this.gameMap = new GameMap(mapWidth, mapHeight);

    this.rabbit = new Rabbit(this.gameMap);
    this.snake = new Snake(this.gameMap);

    this.speedDisplay = new SpeedDisplay();
    this.speedDisplay.snake = this.snake;
    this.scoreDisplay = new ScoreDisplay();
    this.healthBar = new HealthBar(this.snake);

    const container = document.querySelector('.game-container') as HTMLElement;
    this.container = container;
    
    const mapContainer = document.querySelector('.map-container');
    mapContainer.appendChild(this.gameMap.el);

    this.gameStartOverlay = document.querySelector('.game-start');
    this.gamePauseOverlay = document.querySelector('.game-pause');
    this.gameOverOverlay = document.querySelector('.game-over');

    this.gameStartOverlay.style.display = 'flex';
  }

  public restart() {
    this.gameMap.removeSprite(this.snake);
    this.snake = new Snake(this.gameMap);
    this.speedDisplay.snake = this.snake;
    this.healthBar.snake = this.snake;
    this.scoreDisplay.score = 0;
    this.randomRabbitPosition();
    this.isOver = false;
  }

  protected onKeyDown(event: KeyboardEvent) {
    for (let dir = 0; dir < 4; dir++) {
      if (DIR_KEYS_TABLE[dir].find((k) => event.keyCode == k)) {
        this.onDirInput(dir);
        return;
      }
    }

    switch (event.keyCode) {
      case Key.space:
        this.snake.isSpeedUpToMax = false;
        this.snake.msSpeed = this.snake.msSpeedMin;
        break;
      case Key.i:
        this.snake.msSpeedMin += 16.666;
        break;
      case Key.o:
        this.snake.msSpeedMin -= 16.666;
        break;
      case Key.enter:
        if (this.isOver) {
          this.restart();
        }
        this.isPause = !this.isPause;

        this.gameStartOverlay.style.display = 'none';
        this.gamePauseOverlay.style.display = this.isPause ? 'flex' : 'none';
        this.gameOverOverlay.style.display = 'none';
        break;
    }
  }

  protected onUpdate(dt: number): void {
    if (this.isPause) {
      return;
    }

    const { snake } = this;

    snake.isSpeedUpToMax = this.keyboard.isPressed(Key.shift)
      || (!this.keyboard.isPressed(Key.space)
        && this.keyboard.isPressedAny(...DIR_KEYS_TABLE[snake.dir]));
    
    this.gameMap.sprites.forEach((object) => object.onUpdate(dt));

    this.speedDisplay.onUpdate(dt);
    this.healthBar.onUpdate(dt);
    
    if (this.rabbit.isDead) {
      this.rabbit.isDead = false;
      this.randomRabbitPosition();
      this.scoreDisplay.score++;
    }

    if (snake.isDead) {
      this.isOver = true;
      this.isPause = true;
      this.gameOverOverlay.style.display = 'flex';
    }
  }

  private onDirInput(dir: Dir) {
    this.snake.dir = dir; 
  }

  private randomRabbitPosition() {
    let x, y;
    do {
      x = randomInt(0, this.gameMap.width / SPRITE_SIZE) * SPRITE_SIZE;
      y = randomInt(0, this.gameMap.height / SPRITE_SIZE) * SPRITE_SIZE;
    } while(this.snake.isInSnake(x, y));

    this.rabbit.setPosition(x, y);
  }
}
