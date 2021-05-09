import DisplayObject from "./DisplayObject";
import Sprite, { SPRITE_SIZE } from "./sprite";

export default class GameMap extends DisplayObject {

  private _sprites: Set<Sprite> = new Set();
  public get sprites() { return this._sprites; }

  private _width = SPRITE_SIZE * 30;
  public get width() { return this._width; }

  private _height = SPRITE_SIZE * 24;
  public get height() { return this._height; }

  constructor() {
    super();

    this.el.classList.add('map');
    this.el.style.setProperty('--map-width', `${this.width}px`);
    this.el.style.setProperty('--map-height', `${this.height}px`);
  }

  public addSprite(sprite: Sprite) {
    if (this._sprites.has(sprite)) {
      return;
    }
    this.el.appendChild(sprite.el);
    this._sprites.add(sprite);
  }

  public removeSprite(sprite: Sprite) {
    this.el.removeChild(sprite.el);
    this._sprites.delete(sprite);
  }
}