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
    if (snake.msSpeedMin != this.min) {
      this.min = snake.msSpeedMin;
      this.minValueEl.innerText = this.min.toFixed(1);
    }
    if (snake.msSpeed != this.cur) {
      this.cur = snake.msSpeed;
      this.curValueEl.innerText = this.cur.toFixed(1);
    }
    if (snake.msSpeedMax != this.max) {
      this.max = snake.msSpeedMax;
      this.maxValueEl.innerText = this.max.toFixed(1);
    }
  }
}