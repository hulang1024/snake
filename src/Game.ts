import FPSDisplay from "./FPSDisplay";

export default abstract class Game {
  private fpsDisplay = new FPSDisplay();

  constructor() {
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
}