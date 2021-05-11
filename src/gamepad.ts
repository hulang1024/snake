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

  constructor({ onPress }: { onPress: (btn: GamepadButton) => void }) {
    const el = document.querySelector('.gamepad') as HTMLElement;
    el.style.display = 'flex';

    const getGamepadButton = (btn: Element) => {
      let index = BUTTON_CLASS_NAMES.findIndex((c) => btn.classList.contains(c));
      if (index > -1) {
        return BUTTONS[index];
      }
    };

    const { pressedStates } = this;
    el.querySelectorAll('.btn').forEach((btnEl) => {
      btnEl.addEventListener('touchstart', function() {
        const btn = getGamepadButton(this);
        onPress(btn);
        pressedStates.set(btn, true);
        return false;
      });

      btnEl.addEventListener('touchend', function() {
        pressedStates.set(getGamepadButton(this), false);
        return false;
      });
    });
  }

  public isPressed(...btns: GamepadButton[]) {
    return btns.every((b) => this.pressedStates.get(b));
  }

  public isPressedAny(...btns: GamepadButton[]) {
    return btns.find((b) => this.pressedStates.get(b)) != null;
  }
}