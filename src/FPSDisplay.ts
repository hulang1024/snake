import DisplayObject from "./DisplayObject";

export default class FPSDisplay extends DisplayObject {
  private fpsValueEl: HTMLElement;
  private value: number;

  constructor() {
    super();

    const { el } = this;

    el.classList.add('fps-display');

    const label = document.createElement('label');
    label.innerText = 'FPS:';
    el.appendChild(label);

    this.fpsValueEl = document.createElement('span');
    this.fpsValueEl.classList.add('value');
    el.appendChild(this.fpsValueEl);
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