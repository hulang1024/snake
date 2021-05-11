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
import Gamepad, { GamepadButton } from "./gamepad";
import Action from "./Action";

const KEYBOARD_DIR_KEYS_TABLE = [
  [Key.up, Key.w],
  [Key.right, Key.d],
  [Key.down, Key.s],
  [Key.left, Key.a]
];
const GAMEPAD_DIR_BUTTON_TABLE = [
  GamepadButton.up,
  GamepadButton.right,
  GamepadButton.down,
  GamepadButton.left,
];
const DIR_ACTIONS = [Action.DIR_UP, Action.DIR_RIGHT, Action.DIR_DOWN, Action.DIR_LEFT];

export default class SnakeGame extends Game {
  public container: HTMLElement;

  private isOver: boolean = true;
  private isPause: boolean = true;

  private gamepad: Gamepad;

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
    
    const mapWidth = Math.min(document.body.offsetWidth - 16, SPRITE_SIZE * 30);
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

    if (!(window as any).device.desktop()) {
      this.gamepad = new Gamepad({
        onPress: (btn: GamepadButton) => {
          let action: Action;
          switch (btn) {
            case GamepadButton.up:
            case GamepadButton.right:
            case GamepadButton.down:
            case GamepadButton.left:
              action = DIR_ACTIONS[btn];
              break;
            case GamepadButton.ok:
              action = Action.OK;
              break;
          }
          this.onAction(action);
        },
      });
    }
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
      if (KEYBOARD_DIR_KEYS_TABLE[dir].find((k) => event.keyCode == k)) {
        this.onAction(DIR_ACTIONS[dir]);
        return;
      }
    }

    let action: Action;
    switch (event.keyCode) {
      case Key.space:
        action = Action.SPEED_DOWN_INSTANT;
        break;
      case Key.i:
        action = Action.ADJUST_MIN_SPEED_INC;
        break;
      case Key.o:
        action = Action.ADJUST_MIN_SPEED_DEC;
        break;
      case Key.enter:
        action = Action.OK;
        break;
    }
    this.onAction(action);
  }

  private onAction(action: Action) {
    const { snake } = this;

    switch (action) {
      case Action.DIR_UP:
        snake.dir = Dir.UP;
        break;
      case Action.DIR_RIGHT:
        snake.dir = Dir.RIGHT;
        break;
      case Action.DIR_DOWN:
        snake.dir = Dir.DOWN;
        break;
      case Action.DIR_LEFT:
        snake.dir = Dir.LEFT;
        break;
      case Action.SPEED_DOWN_INSTANT:
        snake.isSpeedUpToMax = false;
        snake.speed = snake.speedMin;
        break;
      case Action.ADJUST_MIN_SPEED_INC:
        if (snake.speedMin < snake.speedMax) {
          snake.speedMin = Math.min(snake.speedMin + 1, snake.speedMax);
        }
        break;
      case Action.ADJUST_MIN_SPEED_DEC:
        if (snake.speedMin > 1) {
          snake.speedMin = Math.max(snake.speedMin - 1, 1);;
        }
        break;
      case Action.OK:
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

    // todo: 消除按键硬编码
    let isSpeedUpToMax = false;
    if (this.gamepad) {
      isSpeedUpToMax ||= this.gamepad.isPressed(GamepadButton.speedUp)
        || (!this.gamepad.isPressed(GamepadButton.speedDown)
          && this.gamepad.isPressed(GAMEPAD_DIR_BUTTON_TABLE[snake.dir]));
    }
    isSpeedUpToMax ||= this.keyboard.isPressed(Key.shift)
      || (!this.keyboard.isPressed(Key.space)
        && this.keyboard.isPressedAny(...KEYBOARD_DIR_KEYS_TABLE[snake.dir]));
    snake.isSpeedUpToMax = isSpeedUpToMax;

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

  private randomRabbitPosition() {
    let x, y;
    do {
      x = randomInt(0, this.gameMap.width / SPRITE_SIZE) * SPRITE_SIZE;
      y = randomInt(0, this.gameMap.height / SPRITE_SIZE) * SPRITE_SIZE;
    } while(this.snake.isInSnake(x, y));

    this.rabbit.setPosition(x, y);
  }
}
