import DisplayObject from "./DisplayObject";
import Snake from "./Snake";

export default class SpeedDisplay extends DisplayObject {
  public snake: Snake;

  private minValueEl: HTMLElement;
  private curValueEl: HTMLElement;
  private maxValueEl: HTMLElement;

  private min: number;
  private cur: number;
  private max: number;

  constructor() {
    super();
    this.minValueEl = document.querySelector('.speed-display .values > .min');
    this.curValueEl = document.querySelector('.speed-display .values > .cur');
    this.maxValueEl = document.querySelector('.speed-display .values > .max');
  }

  public onUpdate(dt: number) {
    const { snake } = this;
    if (snake.speedMin != this.min) {
      this.min = snake.speedMin;
      this.minValueEl.innerText = this.min.toFixed(0);
    }
    if (snake.speed != this.cur) {
      this.cur = snake.speed;
      this.curValueEl.innerText = this.cur.toFixed(0);
    }
    if (snake.speedMax != this.max) {
      this.max = snake.speedMax;
      this.maxValueEl.innerText = this.max.toFixed(0);
    }
  }
}