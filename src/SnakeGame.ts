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
const DIR_ACTIONS = [Action.dirUp, Action.dirRight, Action.dirDown, Action.dirLeft];

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
    
    const container = document.querySelector('.game-container') as HTMLElement;
    this.container = container;
    container.appendChild(this.fpsDisplay.el);

    const mapWidth = Math.min(document.body.offsetWidth - 16, SPRITE_SIZE * 30);
    const mapHeight = Math.min(document.body.offsetHeight - 60, SPRITE_SIZE * 24);
    this.gameMap = new GameMap(mapWidth, mapHeight);

    this.rabbit = new Rabbit(this.gameMap);
    this.snake = new Snake(this.gameMap);

    this.speedDisplay = new SpeedDisplay();
    this.speedDisplay.snake = this.snake;
    this.scoreDisplay = new ScoreDisplay();
    this.healthBar = new HealthBar(this.snake);

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
            case GamepadButton.speedDown:
              action = Action.speedDownInstant;
              break;
            case GamepadButton.ok:
              action = Action.ok;
              break;
          }
          this.onAction(action);
        },
      });
    }
  }

  public restart() {
    this.gameMap.removeChild(this.snake);
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
        action = Action.speedDownInstant;
        break;
      case Key.i:
        action = Action.adjustMinSpeedInc;
        break;
      case Key.o:
        action = Action.adjustMinSpeedDec;
        break;
      case Key.enter:
        action = Action.ok;
        break;
    }
    this.onAction(action);
  }

  private onAction(action: Action) {
    const { snake } = this;

    switch (action) {
      case Action.dirUp:
        snake.dir = Dir.UP;
        break;
      case Action.dirRight:
        snake.dir = Dir.RIGHT;
        break;
      case Action.dirDown:
        snake.dir = Dir.DOWN;
        break;
      case Action.dirLeft:
        snake.dir = Dir.LEFT;
        break;
      case Action.speedDownInstant:
        snake.isSpeedUpToMax = false;
        snake.speed = snake.speedMin;
        break;
      case Action.adjustMinSpeedInc:
        if (snake.speedMin < snake.speedMax) {
          snake.speedMin = Math.min(snake.speedMin + 1, snake.speedMax);
        }
        break;
      case Action.adjustMinSpeedDec:
        if (snake.speedMin > 1) {
          snake.speedMin = Math.max(snake.speedMin - 1, 1);;
        }
        break;
      case Action.ok:
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
      if (!this.gamepad.isPressed(GamepadButton.speedDown)) {
        isSpeedUpToMax ||= this.gamepad.isPressed(GamepadButton.speedUp);
        isSpeedUpToMax ||= this.gamepad.isPressed(GAMEPAD_DIR_BUTTON_TABLE[snake.dir])
          && this.gamepad.getPressDuration(GAMEPAD_DIR_BUTTON_TABLE[snake.dir]) > 200;
      }
    }
    if (!this.keyboard.isPressed(Key.space)) {
      isSpeedUpToMax ||= this.keyboard.isPressed(Key.shift);
      const dirKey = this.keyboard.isPressedAny(...KEYBOARD_DIR_KEYS_TABLE[snake.dir]);
      isSpeedUpToMax ||= dirKey && this.keyboard.getPressDuration(dirKey) > 200;
    }
    snake.isSpeedUpToMax = isSpeedUpToMax;

    this.gameMap.objects.forEach((object) => object.onUpdate(dt));

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
