import Dir from "./Dir";
import Sprite, { SPRITE_SIZE } from "./sprite";
import GameMap from "./GameMap";
import DisplayObject from "./DisplayObject";
import Rabbit from "./Rabbit";
import { randomInt } from "./utils";
import GameAudio from "./GameAudio";

const nodeSize = SPRITE_SIZE;

export default class Snake extends DisplayObject {
  public isDead = false;
  public healthValue = 100;

  private _dir: Dir;
  public set dir(newDir: Dir) {
    const oldDir = this.dir;

    if (newDir == oldDir) {
      return;
    }

    let canChange = false;
    switch (this.head.dir) {
      case Dir.UP:
        canChange = newDir != Dir.DOWN;
        break;
      case Dir.RIGHT:
        canChange = newDir != Dir.LEFT;
        break;
      case Dir.DOWN:
        canChange = newDir != Dir.UP;
        break;
      case Dir.LEFT:
        canChange = newDir != Dir.RIGHT;
        break;
    }
    if (canChange) {
      this._dir = newDir;
    }
  }
  public get dir() { return this._dir; }

  private nodes: SnakeNode[] = [];

  private head: SnakeNode;

  // 多少毫秒移动一步
  private msSpeed = 16.666 * 14;

  private map: GameMap;

  constructor(map: GameMap) {
    super();
    this.map = map;

    this.el.classList.add('snake');

    this.el.style.setProperty('--color-filter', `hue-rotate(${randomInt(0, 361)}deg)`);

    this.map.addSprite(this);

    this.init();
  }

  private updateAccTime = 0;

  public onUpdate(dt: number) {
    if (this.isDead) {
      this.updateAccTime = 0;
      return;
    }

    this.updateHealth(dt);
    if (this.isDead) {
      return;
    }

    this.updateAccTime += dt * 1000;

    if (this.updateAccTime < this.msSpeed) {
      return;
    }

    let offset = Math.round(this.updateAccTime / this.msSpeed);

    this.updateAccTime %= this.msSpeed;

    // 因为每步都需要检测，所以使用for而不是offset作为距离乘数
    for (; offset > 0; offset--) {
      if (!this.forward()) {
        this.isDead = true;
        return;
      }
      this.checkCollide();
    }
  }

  private forward(): boolean {
    const { head } = this;

    let offsetD = nodeSize;
    let offsetX = 0;
    let offsetY = 0;
    let isHitWall = true;
    let isHitSelf = false;
    switch (this.dir) {
      case Dir.UP:
        if (head.y - offsetD >= 0) {
          isHitWall = false;
          offsetY = -1 * offsetD;
        }
        isHitSelf = this.isInSnake(head.x, head.y - offsetD);
        break;
      case Dir.RIGHT:
        if (head.x + offsetD < this.map.width) {
          isHitWall = false;
          offsetX = +1 * offsetD;
        }
        isHitSelf = this.isInSnake(head.x + offsetD, head.y);
        break;
      case Dir.DOWN:
        if (head.y + offsetD < this.map.height) {
          isHitWall = false;
          offsetY = +1 * offsetD;
        }
        isHitSelf = this.isInSnake(head.x, head.y + offsetD);
        break;
      case Dir.LEFT:
        if (head.x - offsetD >= 0) {
          isHitWall = false;
          offsetX = -1 * offsetD;
        }
        isHitSelf = this.isInSnake(head.x - offsetD, head.y);
        break;
    }
    if (isHitWall || isHitSelf) {
      return false;
    }

    head.updateDir(this.dir);
    
    for(var i = this.nodes.length - 1; i >= 1; i--) {
      const curr = this.nodes[i];
      // 新加入节点，在此帧绘制
      if (!curr.el.parentNode) {
        const tail = this.nodes[this.nodes.length - 1];
        this.el.insertBefore(curr.el, tail.el);
      }
      const prev = this.nodes[i - 1];
      curr.updateDir(prev.dir);
      curr.setPosition(prev.x, prev.y);
    }

    head.setPosition(head.x + offsetX, head.y + offsetY);

    return true;
  }

  private checkCollide() {
    const { head } = this;
    for (const sprite of this.map.sprites) {
      if (sprite instanceof Rabbit && !sprite.isDead) {
        if (head.x == sprite.x && head.y == sprite.y) {
          sprite.isDead = true;
          this.grow();
          this.healthValue = 100;
          GameAudio.play('eat');
        }
      }
    }
  }

  public isInSnake(x: number, y: number) {
    const { head } = this;
    for (const node of this.nodes) {
      if (head != node && x == node.x && y == node.y) {
        return true;
      }
    }
    return false;
  }

  private grow() {
    const tail = this.nodes[this.nodes.length - 1];
    const newBodyNode = SnakeNode.body(tail.dir);
    newBodyNode.updateDir(tail.dir);
    newBodyNode.setPosition(tail.x, tail.y);
    this.nodes.splice(this.nodes.length - 1, 0, newBodyNode);

    if (this.msSpeed > 0) {
      this.msSpeed = Math.max(16.666, this.msSpeed - 4.16);
    }
  }

  private updateHealth(dt: number) {
    this.healthValue -= dt * 5;
    if (this.healthValue <= 0) {
      this.healthValue = 0;
      this.isDead = true;
    }
  }

  private init() {
    this._dir = Dir.DOWN;

    const makeNodes = (inGridPosArray: number[][]) => {
      inGridPosArray.forEach(([c, r], index) => {
        let node: SnakeNode;
        if (index == 0) {
          node = SnakeNode.head(this.dir);
        } else if (index < inGridPosArray.length - 1) {
          node = SnakeNode.body(this.dir, 'v');
        } else {
          node = SnakeNode.tail(this.dir);
        }
        node.setPosition(c * nodeSize, r * nodeSize);
        this.nodes.push(node);
        this.el.appendChild(node.el);
      });
    };

    makeNodes([
      [10, 1],
      [10, 0]
    ]);

    this.head = this.nodes[0];

    for (let cnt = 0; cnt < 100; cnt++) {
      this.dir = randomInt(0, 4);
      this.forward();
    }
  }
}

class SnakeNode extends Sprite {
  private _dir: Dir;
  public get dir() { return this._dir; }

  private nodeClass: string;

  private constructor(nodeClass: string, dir: Dir) {
    super();
    this._dir = dir;
    this.nodeClass = nodeClass;
    this.el.classList.add('node', nodeClass);
  }

  public static head(dir: Dir) {
    return new SnakeNode(SnakeNode.endNodeClass('head', dir), dir);
  }


  public static body(dir: Dir, type?: string) {
    return new SnakeNode(type ? `body-${type}` : 'body', dir);
  }

  public static tail(dir: Dir) {
    return new SnakeNode(SnakeNode.endNodeClass('tail', dir), dir);
  }
  
  public updateDir(newDir: Dir) {
    const oldDir = this.dir;

    if (this.nodeClass.startsWith('head')) {
      if (newDir != oldDir) {
        this.el.classList.remove(this.nodeClass);
        this.nodeClass = SnakeNode.endNodeClass('head', newDir);
        this.el.classList.add(this.nodeClass);
      }
    } else if (this.nodeClass.startsWith('tail')) {
      if (newDir != oldDir) {
        this.el.classList.remove(this.nodeClass);
        this.nodeClass = SnakeNode.endNodeClass('tail', newDir);
        this.el.classList.add(this.nodeClass);
      }
    } else {
      let newType: string | null = null;
      switch (oldDir) {
        case Dir.UP:
          switch (newDir) {
            case Dir.UP:
              newType = 'v';
              break;
            case Dir.RIGHT:
              newType = '2';
              break;
            case Dir.LEFT:
              newType = '3';
              break;
          }
          break;
        case Dir.RIGHT:
          switch (newDir) {
            case Dir.RIGHT:
              newType = 'h';
              break;
            case Dir.DOWN:
              newType = '3';
              break;
            case Dir.UP:
              newType = '4';
              break;
          }
          break;
        case Dir.DOWN:
          switch (newDir) {
            case Dir.DOWN:
              newType = 'v';
              break;
            case Dir.LEFT:
              newType = '4';
              break;
            case Dir.RIGHT:
              newType = '1';
              break;
          }
          break;
        case Dir.LEFT:
          switch (newDir) {
            case Dir.LEFT:
              newType = 'h';
              break;
            case Dir.UP:
              newType = '1';
              break;
            case Dir.DOWN:
              newType = '2';
              break;
          }
          break;
      }

      const newNodeClass = `body-${newType}`;
      if (newType && this.nodeClass != newNodeClass) {
        this.el.classList.remove(this.nodeClass);
        this.nodeClass = newNodeClass;
        this.el.classList.add(this.nodeClass);
      }
    }
    
    this._dir = newDir;
  }

  private static endNodeClass(name: string, dir: Dir) {
    return `${name}-${['u', 'r', 'd', 'l'][dir]}`;
  }
}