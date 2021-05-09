import DisplayObject from "./DisplayObject";
import Snake from "./Snake";

export default class HealthBar extends DisplayObject {
  public snake: Snake;
  private fillEl: HTMLElement;

  constructor(snake: Snake) {
    super();

    this.snake = snake;

    this._el = document.querySelector('.health-bar');

    this.fillEl = document.createElement('div');

    this.el.appendChild(this.fillEl);
  }

  public onUpdate(dt: number) {
    this.fillEl.style.setProperty('--value', `${this.snake.healthValue}%`);
  }
}