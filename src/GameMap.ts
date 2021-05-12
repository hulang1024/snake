import DisplayObject from "./DisplayObject";
import Sprite from "./sprite";

export default class GameMap extends DisplayObject {
  private _objects: Set<Sprite> = new Set();
  public get objects() { return this._objects; }

  private _width;
  public get width() { return this._width; }

  private _height;
  public get height() { return this._height; }

  constructor(width: number, height: number) {
    super();
    this._width = width;
    this._height = height;

    this.el.classList.add('map');
    this.el.style.setProperty('--map-width', `${this.width}px`);
    this.el.style.setProperty('--map-height', `${this.height}px`);
  }

  public addChild(object: DisplayObject) {
    if (this._objects.has(object)) {
      return;
    }
    this.el.appendChild(object.el);
    this._objects.add(object);
  }

  public removeChild(object: DisplayObject) {
    this.el.removeChild(object.el);
    this._objects.delete(object);
  }
}