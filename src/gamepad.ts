export enum GamepadButton {
  up = 0,
  right = 1,
  down = 2,
  left = 3,
  ok,
  // 专为贪吃蛇定制的特殊的按钮 :)
  speedDown,
  speedUp,
}

const BUTTON_CLASS_NAMES = ['up', 'right', 'down', 'left', 'ok', 'speed-down', 'speed-up'];
const BUTTONS = [
  GamepadButton.up,
  GamepadButton.right,
  GamepadButton.down,
  GamepadButton.left,
  GamepadButton.ok,
  GamepadButton.speedDown,
  GamepadButton.speedUp,
];

export default class Gamepad {
  public readonly pressedStates: Map<GamepadButton, boolean> = new Map();
  private readonly pressedStartTimeMap: Map<GamepadButton, number> = new Map();

  constructor({ onPress }: { onPress: (btn: GamepadButton) => void }) {
    const el = document.querySelector('.gamepad') as HTMLElement;
    el.style.display = 'flex';

    const getGamepadButton = (btn: Element) => {
      let index = BUTTON_CLASS_NAMES.findIndex((c) => btn.classList.contains(c));
      if (index > -1) {
        return BUTTONS[index];
      }
    };

    const { pressedStates, pressedStartTimeMap } = this;
    el.querySelectorAll('.btn').forEach((btnEl) => {
      btnEl.addEventListener('touchstart', function() {
        const btn = getGamepadButton(this);
        onPress(btn);
        pressedStates.set(btn, true);
        pressedStartTimeMap.set(btn, new Date().getTime());
        return false;
      });

      const handleTouchOver = function() {
        const btn = getGamepadButton(this);
        pressedStates.set(btn, false);
        pressedStartTimeMap.set(btn, Infinity);
        return false;
      };
      btnEl.addEventListener('touchend', handleTouchOver);
      btnEl.addEventListener('touchcancel', handleTouchOver);
    });
  }

  public isPressed(...btns: GamepadButton[]) {
    return btns.every((b) => this.pressedStates.get(b));
  }

  public isPressedAny(...btns: GamepadButton[]) {
    return btns.find((b) => this.pressedStates.get(b));
  }

  public getPressDuration(btn: GamepadButton) {
    return new Date().getTime() - this.pressedStartTimeMap.get(btn);
  }
}