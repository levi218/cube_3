import { SCALE_UNIT } from '@/constants';
import { Coordinate } from '@/entities/coordinate';
import p5 from 'p5';
import { QAnimation } from './qAnimation';

export class GameObject {
  protected time = 0;
  constructor(
    public s: p5,
    public pos: Coordinate,
    public scale: Coordinate = { x: 1, y: 1, z: 1 },
    public rotation: Coordinate = { x: 0, y: 0, z: 0 },
    public children: GameObject[] = [],
    public animations: QAnimation[] = [],
    public parent: GameObject = undefined,
  ) {
    // console.log('GameObject created');
  }

  setup(): void {
    // console.log('GameObject setup');
  }

  _draw(): void {
    // console.log('GameObject draw');
  }

  draw(): void {
    this.time += this.s.deltaTime;
    this.doAnimation();
    this.children.forEach((e) => e.doAnimation());
    this.s.push();
    this.s.translate(this.pos.x * SCALE_UNIT, this.pos.y * SCALE_UNIT, 0);
    this.s.rotateX(this.rotation.x);
    this.s.rotateY(this.rotation.y);
    this.s.rotateZ(this.rotation.z);
    this.s.scale(this.scale.x, this.scale.y, this.scale.z);
    this._draw();
    this.s.pop();
    this.children.forEach((e) => e.draw());
  }

  doAnimation(): void {
    // console.log('GameObject doAnimation');
    if (this.animations.length > 0) {
      this.animations[0].animate();
      if (this.animations[0].isDone) {
        this.animations.shift();
      }
    }
  }

  pushAnimation(animation: QAnimation): void {
    this.animations.push(animation);
  }
  unshiftAnimation(animation: QAnimation): void {
    this.animations.unshift(animation);
  }
}
