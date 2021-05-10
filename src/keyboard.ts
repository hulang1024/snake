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
  protected readonly keyPressedStates: Map<number, boolean> = new Map();

  constructor({ onKeyDown, onKeyUp }: { onKeyDown: Function, onKeyUp: Function }) {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      onKeyDown(event);
      this.keyPressedStates.set(event.keyCode, true);
    });
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      onKeyUp(event);
      this.keyPressedStates.set(event.keyCode, false);
    });
  }

  public isPressed(...keys: Key[]) {
    return keys.every((k) => this.keyPressedStates.get(k));
  }

  public isPressedAny(...keys: Key[]) {
    return keys.find((k) => this.keyPressedStates.get(k)) != null;
  }
}
