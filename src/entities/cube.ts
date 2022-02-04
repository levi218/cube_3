import { GameObject } from '@/common/gameObject';
import { SCALE_UNIT } from '@/constants';
import p5 from 'p5';
import { Coordinate } from '@/common/coordinate';
import { QAnimation } from '@/common/qAnimation';
import { GameRoot } from './gameRoot';
const movementDirections = [
  { x: 0, y: +1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: -1, y: 0, z: 0 },
];
class CubeAnimation extends QAnimation {
  constructor(
    s: p5,
    gameObject: GameObject,
    private direction: p5.Vector,
    private offset: Coordinate,
    private isStarted: boolean = false,
    private currentRotation: Coordinate = undefined,
  ) {
    super(s, gameObject);
    this.currentRotation = new Coordinate(0, 0, 0);
  }

  animate() {
    if (!this.isStarted) {
      this.isStarted = true;
      // playSound(SOUND.ROLL, effVolume, false);
      console.log('sound played');
    }
    if (this.isStarted) {
      //   console.log(this.offset);
      this.s.rotateZ(-this.gameObject.rotation.z);
      this.s.rotateY(-this.gameObject.rotation.y);
      this.s.rotateX(-this.gameObject.rotation.x);
      this.s.translate(this.offset.x, this.offset.y, this.offset.z);
      this.s.rotateX(this.currentRotation.x);
      this.s.rotateY(this.currentRotation.y);
      this.s.strokeWeight(5);
      this.s.stroke(255, 0, 0);
      this.s.line(0, 0, 0, 500, 0, 0);
      this.s.stroke(0, 255, 0);
      this.s.line(0, 0, 0, 0, 500, 0);
      this.s.stroke(0, 0, 255);
      this.s.line(0, 0, 0, 0, 0, 500);
      this.s.translate(-this.offset.x, -this.offset.y, -this.offset.z);
      this.s.rotateX(this.gameObject.rotation.x);
      this.s.rotateY(this.gameObject.rotation.y);
      this.s.rotateZ(this.gameObject.rotation.z);
      (this.gameObject as Cube)._draw();

      // if (!this.isFinished) {
      this.currentRotation.x -= 0.15 * this.direction.y;
      this.currentRotation.y += 0.15 * this.direction.x;
      //   if (this.onUpdate) this.onUpdate();
      // }
      console.log(this.currentRotation);
      if (
        this.s.abs(this.currentRotation.x) > this.s.HALF_PI ||
        this.s.abs(this.currentRotation.y) > this.s.HALF_PI
      ) {
        console.log(
          Math.sign(this.currentRotation.x),
          Math.sign(this.currentRotation.y),
        );
        this.gameObject.position.x += this.direction.x;
        this.gameObject.position.y += this.direction.y;
        const cube = this.gameObject as Cube;
        cube.updateSideAndRotation(this.direction);
        cube.checkKeyInSight();
        this.finish();
      }
    }
  }
}

export class Cube extends GameObject {
  constructor(
    gameRoot: GameObject,
    position: Coordinate,
    public facing = new Coordinate(0, 0, 1),
  ) {
    super(gameRoot.s, position, gameRoot, gameRoot);
  }
  _drawEye(): void {
    // CUBE's EYE WITH FIELD OF VISION
    this.s.push();
    this.s.rotateZ(this.time / 1000);
    this.s.translate(
      0,
      0,
      SCALE_UNIT / 2 + 20 + this.s.sin(this.time / 700) * 5,
    );
    this.s.stroke(255, 255, 0);
    this.s.noFill();
    this.s.torus(15, 3, 4, 3);
    this.s.pop();

    this.s.push();
    this.s.noFill();
    this.s.rotateZ(-this.time / 1000);
    this.s.translate(
      0,
      0,
      SCALE_UNIT / 2 + 15 - this.s.sin(this.time / 1000) * 5,
    );
    this.s.torus(20, 3, 6, 3);
    this.s.pop();
  }
  _drawCube(): void {
    this.s.stroke(255);
    this.s.fill(255, 102, 94);
    this.s.box(SCALE_UNIT);
  }
  _draw(): void {
    // CUBE
    this._drawCube();
    this._drawEye();

    // VISION CONE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const gl = (document.getElementById('defaultCanvas0') as any).getContext(
    //   'webgl',
    // );
    // gl.disable(gl.DEPTH_TEST);
    // s.push();
    // s.noStroke();
    // s.fill(200, 200, 0, 20);
    // s.rotateX(-s.PI / 2);
    // s.rotateY(time / 5000);
    // const coneHeight = 200;
    // s.translate(0, -50 - coneHeight / 2, 0);
    // s.cone(150, coneHeight, 10, 1, true);
    // s.pop();
    // gl.enable(gl.DEPTH_TEST);
  }

  checkKeyInSight(): void {
    const gameRoot = this.gameRoot as GameRoot;
    const keyIndex = gameRoot.keys.findIndex(
      (e) =>
        e.position.x == this.position.x + this.facing.x &&
        e.position.y == this.position.y + this.facing.y,
    );
    if (keyIndex != -1) {
      gameRoot.door.disableRing(keyIndex);
      gameRoot.keys[keyIndex].keyLoot(this);
    }
  }

  updateSideAndRotation(direction: Coordinate): void {
    // console.log((new p5.Vector(direction.x, direction.y).cross(new p5.Vector(0,0,1)).dot(this.facing)))
    const facingVector = new p5.Vector(
      this.facing.x,
      this.facing.y,
      this.facing.z,
    );
    if (
      new p5.Vector(direction.x, direction.y)
        .cross(new p5.Vector(0, 0, 1))
        .dot(facingVector) == 0
    ) {
      //rolling affects facing
      if (direction.x == 1)
        this.facing = facingVector.cross(new p5.Vector(0, -1, 0));
      if (direction.x == -1)
        this.facing = facingVector.cross(new p5.Vector(0, 1, 0));
      if (direction.y == 1)
        this.facing = facingVector.cross(new p5.Vector(1, 0, 0));
      if (direction.y == -1)
        this.facing = facingVector.cross(new p5.Vector(-1, 0, 0));
      console.log(this.facing);
    } else {
      // not affects
    }
    this.rotation = new Coordinate(
      -this.facing.y * this.s.HALF_PI +
        (this.facing.z != 0 ? (this.facing.z - 1) * this.s.HALF_PI : 0),
      this.facing.x * this.s.HALF_PI,
      0,
    );
    // the above is short for these formula:
    // if (cube.facing.equals(1, 0, 0)) {
    //   this.gameObject.rotation = new Coordinate(0, this.s.HALF_PI, 0);
    // }
    // if (cube.facing.equals(-1, 0, 0)) {
    //   this.gameObject.rotation = new Coordinate(0, -this.s.HALF_PI, 0);
    // }
    // if (cube.facing.equals(0, 1, 0)) {
    //   this.gameObject.rotation = new Coordinate(-this.s.HALF_PI, 0, 0);
    // }
    // if (cube.facing.equals(0, -1, 0)) {
    //   this.gameObject.rotation = new Coordinate(this.s.HALF_PI, 0, 0);
    // }
    // if (cube.facing.equals(0, 0, 1)) {
    //   this.gameObject.rotation = new Coordinate(0, 0, 0);
    // }
    // if (cube.facing.equals(0, 0, -1)) {
    //   this.gameObject.rotation = new Coordinate(this.s.PI, 0, 0);
    // }
  }

  move(direction: Coordinate): void {
    // console.log(this.animations.length);
    if (this.animations.length > 0) {
      return;
    }
    // check z, choose animation, generate and add animation to array
    const offset = new Coordinate(
      (direction.x * SCALE_UNIT) / 2,
      (direction.y * SCALE_UNIT) / 2,
      //   0,
      -SCALE_UNIT / 2,
    );

    this.pushAnimation(new CubeAnimation(this.s, this, direction, offset));
  }

  handleInput(keyCode: number): void {
    let direction = null;
    switch (keyCode) {
      case 65:
      case this.s.LEFT_ARROW:
        direction = movementDirections[1];
        break;
      case 68:
      case this.s.RIGHT_ARROW:
        direction = movementDirections[3];
        break;
      case 83:
      case this.s.DOWN_ARROW:
        direction = movementDirections[2];
        break;
      case 87:
      case this.s.UP_ARROW:
        direction = movementDirections[0];
        break;
    }
    if (direction) {
      //   console.log('rolling toward direction: ', direction);
      this.move(direction);
      // if()
    }
  }
}
