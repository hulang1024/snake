import FPSDisplay from "./FPSDisplay";
import { Keyboard } from "./keyboard";

export default abstract class Game {
  protected fpsDisplay = new FPSDisplay();
  protected keyboard: Keyboard;

  constructor() {
    this.setupUpdateLoop();

    this.keyboard = new Keyboard({
      onKeyDown: this.onKeyDown.bind(this),
      onKeyUp: this.onKeyUp.bind(this)
    });
  }

  private setupUpdateLoop() {
    const fpsDisplayUpdate = this.fpsDisplay.onUpdate.bind(this.fpsDisplay);
    const onUpdate = this.onUpdate.bind(this);

    let lastTime = 0;
    const update = (time: number) => {
      const dt = (time - (lastTime == 0 ? time : lastTime)) / 1000;
      onUpdate(dt);
      fpsDisplayUpdate(dt);
      lastTime = time;
      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }

  protected abstract onUpdate(dt: number): void;

  protected onKeyDown(event: KeyboardEvent) {}

  protected onKeyUp(event: KeyboardEvent) {}

}