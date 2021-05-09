import GameMap from "./GameMap";
import Sprite from "./sprite";

export default class Rabbit extends Sprite {
  public isDead = false;

  constructor(map: GameMap) {
    super();
  
    this.el.classList.add('rabbit');
    map.addSprite(this);
  }
}