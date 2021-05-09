import DisplayObject from "./DisplayObject";

export default abstract class Sprite extends DisplayObject {
  constructor() {
    super();
    this.el.classList.add('sprite');
  }
}

export const SPRITE_SIZE = 16;
