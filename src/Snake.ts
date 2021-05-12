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

  public speedMin = 3;

  public speedMax = 150;

  public isSpeedUpToMax = false;

  private _speed = this.speedMin;
  public get speed() { return this._speed; }
  public set speed(val: number) { this._speed = val; }

  // 加速度dt因子
  private accel = 60;

  private map: GameMap;

  constructor(map: GameMap) {
    super();
    this.map = map;

    this.el.classList.add('snake');

    this.el.style.setProperty('--color-filter', `hue-rotate(${randomInt(0, 361)}deg)`);

    this.map.addChild(this);

    this.init();
  }

  private updateAccTime = 0;

  public onUpdate(dt: number) {
    if (this.isDead) {
      this.updateAccTime = 0;
      return;
    }

    if (this.isSpeedUpToMax) {
      if (this._speed < this.speedMax) {
        this._speed = Math.min(this._speed + this.accel * dt, this.speedMax);
      }
    } else {
      if (this._speed > this.speedMin) {
        this._speed = Math.max(this._speed - this.accel * dt, this.speedMin);
      } else if (this._speed < this.speedMin) {
        this._speed = Math.min(this._speed + this.accel * dt, this.speedMin);
      }
    }

    this.updateHealth(dt);
    if (this.isDead) {
      return;
    }

    this.updateAccTime += dt * 1000;

    const speed = this._speed / 100;

    let offset = Math.floor(this.updateAccTime / (1000 / 60) * speed);
    if (offset == 0) {
      return;
    }

    this.updateAccTime = this.updateAccTime / (1000 / 60) % speed;

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
    
    for(let i = this.nodes.length - 1; i >= 1; i--) {
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
    for (const sprite of this.map.objects) {
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

    if (this._speed > 0) {
      this._speed = Math.max(16.666, this._speed - 4.16);
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

enum SnakeNodeType {
  HEAD,
  BODY,
  TAIL
};

class SnakeNode extends Sprite {
  private _dir: Dir;
  public get dir() { return this._dir; }

  private type: SnakeNodeType;
  private nodeClass: string;

  private constructor(type: SnakeNodeType | string, dir: Dir) {
    super();

    this._dir = dir;

    switch (type) {
      case SnakeNodeType.HEAD:
      case SnakeNodeType.TAIL:
        this.type = type;
        this.nodeClass = SnakeNode.endNodeClass(type, dir);
        break;
      default:
        this.type = SnakeNodeType.BODY;
        this.nodeClass = `body-${type as unknown as string}`;
        break;
    }
    
    this.el.classList.add('node', this.nodeClass);
  }

  public static head(dir: Dir) {
    return new SnakeNode(SnakeNodeType.HEAD, dir);
  }

  public static body(dir: Dir, subType?: string) {
    return new SnakeNode(subType, dir);
  }

  public static tail(dir: Dir) {
    return new SnakeNode(SnakeNodeType.TAIL, dir);
  }
  
  private static readonly BODY_NODE_DIR_STATE_TABLE = [
    ['v', 'tl', null, 'tr'],
    ['br', 'h', 'tr', null],
    [null, 'bl', 'v', 'br'],
    ['bl', null, 'tl', 'h'],
  ];

  public updateDir(newDir: Dir) {
    const oldDir = this.dir;

    switch (this.type) {
      case SnakeNodeType.HEAD:
      case SnakeNodeType.TAIL:
        if (newDir != oldDir) {
          const newNodeClass = SnakeNode.endNodeClass(this.type, newDir);
          this.el.classList.replace(this.nodeClass, newNodeClass);
          this.nodeClass = newNodeClass;
        }
        break;
      case SnakeNodeType.BODY:
        const newType: string | null = SnakeNode.BODY_NODE_DIR_STATE_TABLE[oldDir][newDir];
        const newNodeClass = `body-${newType}`;
        if (this.nodeClass != newNodeClass) {
          this.el.classList.replace(this.nodeClass, newNodeClass);
          this.nodeClass = newNodeClass;
        }
        break;
    }
    
    this._dir = newDir;
  }

  private static endNodeClass(type: SnakeNodeType, dir: Dir) {
    return `${type == SnakeNodeType.HEAD ? 'head' : 'tail'}-${['u', 'r', 'd', 'l'][dir]}`;
  }
}