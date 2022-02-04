import { SCALE_UNIT } from '@/constants';
import { Coordinate } from '@/common/coordinate';
import p5 from 'p5';
import { QAnimation } from './qAnimation';
import { GameRoot } from '@/entities/gameRoot';

export class GameObject {
  static DEFAULT_SCALE = new Coordinate(1, 1, 1);
  static DEFAULT_ROTATION = new Coordinate(0, 0, 0);
  protected time = 0;
  constructor(
    public s: p5,
    public position: Coordinate,
    public gameRoot: GameObject = undefined,
    public parent: GameObject = undefined,
    public scale = GameObject.DEFAULT_SCALE,
    public rotation = GameObject.DEFAULT_ROTATION,
    public children: GameObject[] = [],
    public animations: QAnimation[] = [],
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
    this.s.push();
    this.s.translate(
      this.position.x * SCALE_UNIT,
      this.position.y * SCALE_UNIT,
      0,
    );
    this.s.rotateX(this.rotation.x);
    this.s.rotateY(this.rotation.y);
    this.s.rotateZ(this.rotation.z);
    this.s.scale(this.scale.x, this.scale.y, this.scale.z);
    this.doAnimation();
    const shouldDraw = this.shouldDraw();
    if (this.animations.length == 0 && shouldDraw) this._draw();
    this.s.pop();
    if (shouldDraw) this.children.forEach((e) => e.draw());
  }

  doAnimation(): void {
    // console.log('GameObject doAnimation');
    if (this.animations.length > 0) {
      const lastIndex = this.animations.length - 1;
      this.animations[lastIndex].animate();
      if (this.animations[lastIndex].isDone) {
        this.animations.pop();
      }
    }
  }

  shouldDraw(): boolean {
    if (!this.gameRoot) return true;
    return (
      this.s.dist(
        this.position.x,
        this.position.y,
        (this.gameRoot as GameRoot).cube.position.x,
        (this.gameRoot as GameRoot).cube.position.y,
      ) < 3
    );
  }

  pushAnimation(animation: QAnimation): void {
    this.animations.push(animation);
  }
  unshiftAnimation(animation: QAnimation): void {
    this.animations.unshift(animation);
  }
  handleInput(keyCode: number): void {
    this.children.forEach((e) => e.handleInput(keyCode));
  }
}
