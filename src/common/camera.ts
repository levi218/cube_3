import { SCALE_UNIT } from '@/constants';
import { Coordinate } from './coordinate';
import { GameObject } from './gameObject';

export class Camera extends GameObject {
  constructor(
    gameRoot: GameObject,
    public followTarget: GameObject,
    public cameraOffset = new Coordinate(-400, -400, 600),
  ) {
    super(gameRoot, Coordinate.add(cameraOffset, followTarget.position));
  }

  draw(): void {
    const followTargetPosition = Coordinate.mult(
      this.followTarget.position,
      SCALE_UNIT,
    ) as unknown as Coordinate;
    const cameraPosition = Coordinate.add(
      this.cameraOffset,
      followTargetPosition,
    );
    // add lerp
    this.position = Coordinate.lerp(this.position, cameraPosition, 0.1);
    const focusPoint = Coordinate.sub(this.position, this.cameraOffset);
    this.s.camera(
      this.position.x,
      this.position.y,
      this.position.z,
      focusPoint.x,
      focusPoint.y,
      focusPoint.z,
      0,
      0,
      -1,
    );
  }
}
