export default abstract class DisplayObject {
  private _x: number;

  private _y: number;

  protected _el: HTMLElement;

  public get el() { return this._el; }

  constructor() {
    this._el = document.createElement('div');
  }

  public setPosition(x: number, y: number) {
    this._x = x;
    this._y = y;
    this.el.style.setProperty('--pos-transform', `translate(${x}px, ${y}px)`);
  }

  public get x() { return this._x; }

  public set x(val) {
    this.setPosition(val, this._y);
  }

  public get y() { return this._y; }

  public set y(val) {
    this.setPosition(this._x, val);
  }

  public onUpdate(dt: number): void {}
}
