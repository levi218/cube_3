import { GameObject } from '@/common/gameObject';
import { QAnimation } from '@/common/qAnimation';
import { KEY_COLORS, SCALE_UNIT } from '@/constants';
import p5 from 'p5';
import { Coordinate } from './coordinate';

export class KeyConsumingAnimation extends QAnimation {
  constructor(s: p5, gameObject: GameObject, private target: GameObject) {
    super(s, gameObject);
  }
  animate(): void {
    this.gameObject.pos.x = this.s.lerp(
      this.gameObject.pos.x,
      this.target.pos.x,
      0.05,
    );
    this.gameObject.pos.y = this.s.lerp(
      this.gameObject.pos.y,
      this.target.pos.y,
      0.05,
    );
    this.gameObject.scale = new Coordinate(
      this.s.lerp(this.gameObject.scale.x, 0, 0.01),
      this.s.lerp(this.gameObject.scale.y, 0, 0.01),
      this.s.lerp(this.gameObject.scale.z, 0, 0.01),
    );
  }
}

export class Key extends GameObject {
  private scaleFactor = 1;
  constructor(s: p5, public index: number, pos: Coordinate) {
    super(s, pos);
  }

  keyLoot(target: GameObject): void {
    this.unshiftAnimation(new KeyConsumingAnimation(this.s, this, target));
  }

  _draw(): void {
    // TODO: KEY
    this.s.fill(
      KEY_COLORS[this.index][0],
      KEY_COLORS[this.index][1],
      KEY_COLORS[this.index][2],
      KEY_COLORS[this.index][3],
    );
    this.s.rotateZ(this.time / 1000);
    this.s.box(
      0.25 * SCALE_UNIT * this.scaleFactor,
      0.25 * SCALE_UNIT * this.scaleFactor,
      0.25 * SCALE_UNIT * this.scaleFactor,
    );
    this.s.rotate(this.s.PI / 4, [1, 0, 1]);
    this.s.rotateX(this.time / 1000);
    this.s.noFill();
    this.s.box(
      0.5 * SCALE_UNIT * this.scaleFactor,
      0.5 * SCALE_UNIT * this.scaleFactor,
      0.5 * SCALE_UNIT * this.scaleFactor,
    );
  }
}
