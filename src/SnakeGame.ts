import Dir from "./Dir";
import DisplayObject from "./DisplayObject";
import Game from "./Game";
import GameMap from "./GameMap";
import HealthBar from "./HealthBar";
import Rabbit from "./Rabbit";
import ScoreDisplay from "./ScoreDisplay";
import Snake from "./Snake";
import { SPRITE_SIZE } from "./sprite";
import { randomInt } from "./utils";

export default class SnakeGame extends Game {
  public container: HTMLElement;
  private isOver: boolean = true;
  private isPause: boolean = true;
  private gameMap: GameMap = new GameMap();
  private snake: Snake;
  private rabbit: Rabbit;

  private scoreDisplay: ScoreDisplay;
  private healthBar: HealthBar;

  private gameStartOverlay: HTMLElement;
  private gamePauseOverlay: HTMLElement;
  private gameOverOverlay: HTMLElement;

  private objects: Set<DisplayObject> = this.gameMap.sprites;

  constructor() {
    super();

    this.rabbit = new Rabbit(this.gameMap);
    this.snake = new Snake(this.gameMap);
    this.scoreDisplay = new ScoreDisplay();
    this.healthBar = new HealthBar(this.snake);

    const container = document.querySelector('.game-container') as HTMLElement;
    this.container = container;
    
    container.appendChild(this.gameMap.el);
    this.gameStartOverlay = document.querySelector('.game-start');
    this.gamePauseOverlay = document.querySelector('.game-pause');
    this.gameOverOverlay = document.querySelector('.game-over');

    this.gameStartOverlay.style.display = 'flex';

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case 87:
        case 38:
          this.onDirInput(Dir.UP);
          break;
        case 68:
        case 39:
          this.onDirInput(Dir.RIGHT);
          break;
        case 65:
        case 37:
          this.onDirInput(Dir.LEFT);
          break;
        case 83:
        case 40:
          this.onDirInput(Dir.DOWN);
          break;
        case 13: // enter
        case 32: // space
          if (this.isOver) {
            this.gameMap.removeSprite(this.snake);
            this.snake = new Snake(this.gameMap);
            this.healthBar.snake = this.snake;
            this.scoreDisplay.score = 0;
            this.randomRabbitPosition();
            this.isOver = false;
          }
          this.isPause = !this.isPause;

          if (this.isPause) {
            this.gameStartOverlay.style.display = 'none';
            this.gamePauseOverlay.style.display = 'flex';
            this.gameOverOverlay.style.display = 'none';
          } else {
            this.gameStartOverlay.style.display = 'none';
            this.gamePauseOverlay.style.display = 'none';
            this.gameOverOverlay.style.display = 'none';
          }
          break;
      }
    });
  }

  protected onUpdate(dt: number): void {
    if (this.isPause) {
      return;
    }
    this.objects.forEach((object) => object.onUpdate(dt));
    this.healthBar.onUpdate(dt);
    
    if (this.rabbit.isDead) {
      this.rabbit.isDead = false;
      this.randomRabbitPosition();
      this.scoreDisplay.score++;
    }

    if (this.snake.isDead) {
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
