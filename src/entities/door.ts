import { GameObject } from '@/common/gameObject';
import { QAnimation } from '@/common/qAnimation';
import { KEY_COLORS } from '@/constants';
import p5 from 'p5';
import { Coordinate } from './coordinate';

export class DoorRingDisappearAnimation extends QAnimation {
  animate(): void {
    this.gameObject.scale = new Coordinate(
      this.s.lerp(this.gameObject.scale.x, 0, 0.01),
      this.s.lerp(this.gameObject.scale.y, 0, 0.01),
      this.s.lerp(this.gameObject.scale.z, 0, 0.01),
    );
    if (this.gameObject.scale.x < 0.1) {
      console.log('animation done');
      super.finish();
      (this.gameObject as DoorRing).isEnabled = false;
      if (
        this.gameObject.parent.children.filter((e) => (e as DoorRing).isEnabled)
          .length == 0
      ) {
        (this.gameObject.parent as Door).open();
      }
    }
  }
}
export class DoorRing extends GameObject {
  constructor(
    s: p5,
    pos: Coordinate,
    parent: Door,
    public color: number[],
    public index: number,
    public isEnabled: boolean,
  ) {
    super(s, pos);
    this.parent = parent;
  }
  _draw(): void {
    if (this.isEnabled) {
      this.s.noStroke();
      this.s.rotateY(this.s.PI / 2);
      this.s.rotateZ(
        (this.time / 3000 / (this.index + 1)) * (this.index % 2 ? -1 : 1),
      );
      this.s.translate(
        0,
        0,
        this.s.sin(this.time / 2000 / (this.index + 1)) * 20,
      );
      this.s.fill(this.color[0], this.color[1], this.color[2], this.color[3]);
      this.s.torus(45, 5, 4, 3);
    }
  }

  disappear(): void {
    this.pushAnimation(new DoorRingDisappearAnimation(this.s, this));
  }
}
export class Door extends GameObject {
  public doorOpened = false;
  public doorAnimationTime = 0;
  constructor(s: p5, position: Coordinate, ringStatuses: boolean[] = []) {
    super(s, position);
    if (ringStatuses.length > KEY_COLORS.length) {
      ringStatuses = ringStatuses.slice(0, KEY_COLORS.length);
    }
    ringStatuses.forEach((status, index) => {
      this.children.push(
        new DoorRing(s, position, this, KEY_COLORS[index], index, status),
      );
    });
  }

  disableRing(index: number): void {
    if (this.children[index]) {
      (this.children[index] as DoorRing).disappear();
    }
  }

  open(): void {
    this.doorOpened = true;
    this.doorAnimationTime = 0;
  }

  _draw(): void {
    // TODO: DOOR
    if (!this.doorOpened) {
      // for (let i = 0; i < KEY_COLORS.length; i++) {
      //   if (this.ringStatuses[i]) {
      //     this.s.push();
      //     this.s.noStroke();
      //     this.s.rotateY(this.s.PI / 2);
      //     this.s.rotateZ((this.time / 3 / (i + 1)) * (i % 2 ? -1 : 1));
      //     this.s.translate(0, 0, this.s.sin(this.time / 2 / (i + 1)) * 20);
      //     this.s.fill(
      //       KEY_COLORS[i][0],
      //       KEY_COLORS[i][1],
      //       KEY_COLORS[i][2],
      //       KEY_COLORS[i][3],
      //     );
      //     this.s.torus(45, 5, 4, 3);
      //     this.s.pop();
      //   }
      // }
    } else {
      this.doorAnimationTime += this.s.deltaTime / 1000;
      this.s.rotateY(this.s.PI / 2);
      this.s.fill(255, 255, 255, 15);
      for (let i = 0; i < 20; i++) {
        if (i != 19 && i != 10) {
          this.s.noStroke();
        } else {
          this.s.stroke(255);
        }
        this.s.box(
          this.doorAnimationTime * 200 < i * 7
            ? this.doorAnimationTime * 200
            : i * 7,
        );
      }
    }
  }
}
