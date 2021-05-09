export default class ScoreDisplay {
  public el: HTMLElement;
  private numberEl: HTMLElement;
  private _score: number = 0;

  constructor() {
    this.el = document.querySelector('.score-display');
    this.numberEl = this.el.querySelector('.score-number');
  }

  public get score() { return this._score; }
  public set score(val: number) {
    this._score = val;
    this.numberEl.innerText = this.score.toString();
  }
}