export enum Key {
  up = 38,
  right = 39,
  down =  40,
  left = 37,

  w = 87,
  d = 68,
  s = 83,
  a = 65,
  i = 73,
  o = 79,

  enter = 13,
  shift = 16,
  space = 32,
}

export class Keyboard {
  private readonly pressedStates: Map<number, boolean> = new Map();
  private readonly pressedStartTimeMap: Map<number, number> = new Map();

  constructor({ onKeyDown, onKeyUp }: { onKeyDown: Function, onKeyUp: Function }) {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      onKeyDown(event);
      this.pressedStates.set(event.keyCode, true);
      if (!event.repeat) {
        this.pressedStartTimeMap.set(event.keyCode, new Date().getTime());
      }
    });
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      onKeyUp(event);
      this.pressedStates.set(event.keyCode, false);
      this.pressedStartTimeMap.set(event.keyCode, Infinity);
    });
  }

  public isPressed(...keys: Key[]) {
    return keys.every((k) => this.pressedStates.get(k));
  }

  public isPressedAny(...keys: Key[]) {
    return keys.find((k) => this.pressedStates.get(k));
  }

  public getPressDuration(key: Key) {
    return new Date().getTime() - this.pressedStartTimeMap.get(key);
  }
}
