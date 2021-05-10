import DisplayObject from "./DisplayObject";

export default class FPSDisplay extends DisplayObject {
  private fpsValueEl: HTMLElement;
  private value: number;

  constructor() {
    super();
    this.fpsValueEl = document.querySelector('.fps-display .value');
  }

  public onUpdate(dt: number) {
    const nowFPS = Math.round(1000 / (dt * 1000));
    if (this.value == nowFPS) {
      return;
    }
    this.fpsValueEl.innerText = nowFPS.toString();
    const { classList } = this.fpsValueEl;
    if (nowFPS >= 60) {
      classList.remove('bad');
      classList.add('good');
    } else {
      classList.remove('good');
      classList.add('bad');
    }
    
    this.value = nowFPS;
  }
}