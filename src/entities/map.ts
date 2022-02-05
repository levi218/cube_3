import { GameObject } from '@/common/gameObject';
import { QAnimation } from '@/common/qAnimation';
// import { QAnimation } from '@/common/qAnimation';
import { SCALE_UNIT } from '@/constants';
import p5 from 'p5';
import { Coordinate } from '../common/coordinate';
import { GameRoot } from './gameRoot';
export class MapCellAppearing extends QAnimation {
  static FRAG_COUNT_PER_AXIS = 6;
  private fragmentZs: number[][];
  private fragmentZDestinations: number[][];
  private fragmentOpacities: number[][];
  constructor(s: p5, gameObject: GameObject, private isDisappearing = false) {
    super(s, gameObject);
    this.fragmentZs = Array(MapCellAppearing.FRAG_COUNT_PER_AXIS)
      .fill(0)
      .map(() =>
        Array(MapCellAppearing.FRAG_COUNT_PER_AXIS).fill(
          isDisappearing ? 0 : (Math.random() * 6 - 3) * SCALE_UNIT,
        ),
      );
    this.fragmentZDestinations = Array(MapCellAppearing.FRAG_COUNT_PER_AXIS)
      .fill(0)
      .map(() =>
        Array(MapCellAppearing.FRAG_COUNT_PER_AXIS).fill(
          isDisappearing ? (Math.random() * 12 - 6) * SCALE_UNIT : 0,
        ),
      );
    this.fragmentOpacities = Array(MapCellAppearing.FRAG_COUNT_PER_AXIS)
      .fill(0)
      .map(() =>
        Array(MapCellAppearing.FRAG_COUNT_PER_AXIS).fill(
          isDisappearing ? 255 : 0,
        ),
      );
    console.log('this.fragmentOpacities', this.gameObject.position);
  }
  animate(): void {
    const fragmenSize = SCALE_UNIT / MapCellAppearing.FRAG_COUNT_PER_AXIS;
    let maxDiff = 0;

    const gl = (
      document.getElementById('defaultCanvas0') as HTMLCanvasElement
    ).getContext('webgl');
    for (let i = 0; i < MapCellAppearing.FRAG_COUNT_PER_AXIS; i++) {
      for (let j = 0; j < MapCellAppearing.FRAG_COUNT_PER_AXIS; j++) {
        const lerpAmount =
          ((MapCellAppearing.FRAG_COUNT_PER_AXIS * 0.9 -
            this.s.dist(
              MapCellAppearing.FRAG_COUNT_PER_AXIS / 2,
              MapCellAppearing.FRAG_COUNT_PER_AXIS / 2,
              i,
              j,
            )) /
            (MapCellAppearing.FRAG_COUNT_PER_AXIS * 5)) *
          (this.isDisappearing ? 2 : 1);

        this.fragmentOpacities[i][j] = this.s.lerp(
          this.fragmentOpacities[i][j],
          this.isDisappearing ? 0 : 255,
          lerpAmount,
        );
        this.fragmentZs[i][j] = this.s.lerp(
          this.fragmentZs[i][j],
          this.fragmentZDestinations[i][j],
          lerpAmount,
        );
        if (this.isDisappearing) {
          maxDiff = Math.max(
            maxDiff,
            Math.abs(this.fragmentZDestinations[i][j] - this.fragmentZs[i][j]),
          );
        } else {
          maxDiff = Math.max(maxDiff, Math.abs(this.fragmentZs[i][j]));
        }
        this.s.push();
        if (this.fragmentZs[i][j] > 0) gl.disable(gl.DEPTH_TEST);
        this.s.noStroke();
        this.s.translate(
          fragmenSize * j - SCALE_UNIT / 2 + fragmenSize / 2,
          fragmenSize * i - SCALE_UNIT / 2 + fragmenSize / 2,
          this.fragmentZs[i][j] + (-6 * SCALE_UNIT) / 10,
        );
        this.s.fill(
          this.s.red((this.gameObject as MapCell).color),
          this.s.green((this.gameObject as MapCell).color),
          this.s.blue((this.gameObject as MapCell).color),
          this.fragmentOpacities[i][j],
        );
        this.s.box(fragmenSize, fragmenSize, SCALE_UNIT / 5);
        if (this.fragmentZs[i][j] > 0) gl.enable(gl.DEPTH_TEST);
        this.s.pop();
      }
    }
    this.s.push();
    this.s.stroke(255);
    this.s.noFill();
    this.s.translate(0, 0, (-6 * SCALE_UNIT) / 10);
    this.s.box(SCALE_UNIT, SCALE_UNIT, SCALE_UNIT / 5);
    this.s.pop();

    if (maxDiff < 5) {
      this.finish();
    }
  }
}
export class MapCell extends GameObject {
  public color: p5.Color;
  public isEnabled: boolean = undefined;
  constructor(gameRoot: GameObject, position: Coordinate, private map: Map) {
    super(gameRoot, position);
    this.color = this.s.color(145, 196, 131);
  }
  _draw(): void {
    this.s.translate(0, 0, (-6 * SCALE_UNIT) / 10);
    this.s.stroke(255);
    if (
      this.s.dist(
        this.position.x,
        this.position.y,
        (this.gameRoot as GameRoot).cube.position.x,
        (this.gameRoot as GameRoot).cube.position.y,
      ) < 3
    ) {
      if (this.isEnabled === undefined) this.isEnabled = true;
      if (this.isEnabled === false) {
        this.isEnabled = true;
        if (this.map.mapData[this.position.x][this.position.y] !== 0)
          this.animations.push(new MapCellAppearing(this.s, this, false));
      }
      if (this.map.mapData[this.position.x][this.position.y] !== 0) {
        this.s.fill(145, 196, 131);
        this.s.box(SCALE_UNIT, SCALE_UNIT, SCALE_UNIT / 5);
      }
    } else {
      if (this.isEnabled === undefined) this.isEnabled = false;
      if (this.isEnabled === true) {
        this.isEnabled = false;
        if (this.map.mapData[this.position.x][this.position.y] !== 0)
          this.animations.push(new MapCellAppearing(this.s, this, true));
      }
      this.s.noFill();
      this.s.translate(
        0,
        0,
        this.s.sin(this.time / 1000 + this.position.x + this.position.y) * 10,
      );
      this.s.box(SCALE_UNIT, SCALE_UNIT, SCALE_UNIT / 5);
    }
  }
  shouldDraw(): boolean {
    return true;
  }
}
export class Map extends GameObject {
  constructor(
    // s: p5,
    gameRoot: GameObject,
    public mapData: number[][],
    public mapWidth: number,
    public mapHeight: number,
  ) {
    super(gameRoot, new Coordinate(0, 0));
  }

  setup(): void {
    for (let i = 0; i < this.mapWidth; i++) {
      for (let j = 0; j < this.mapHeight; j++) {
        this.children.push(
          new MapCell(this.gameRoot, new Coordinate(j, i), this),
        );
      }
    }
  }

  _draw(): void {
    // console.log('Map draw');
    // this.s.push();
    // this.s.fill(145, 196, 131);
    // this.s.stroke(255);
    // for (let i = 0; i < this.mapWidth; i++) {
    //   for (let j = 0; j < this.mapHeight; j++) {
    //     this.s.push();
    //     this.s.translate(
    //       SCALE_UNIT * i,
    //       SCALE_UNIT * j,
    //       (-6 * SCALE_UNIT) / 10,
    //     );
    //     // TODO: uncomment to hide block further than radius
    //     if (
    //       this.s.dist(
    //         i,
    //         j,
    //         (this.gameRoot as GameRoot).cube.position.x,
    //         (this.gameRoot as GameRoot).cube.position.y,
    //       ) < 3
    //     ) {
    //       if (this.mapData[i][j] !== 0)
    //         this.s.box(SCALE_UNIT, SCALE_UNIT, SCALE_UNIT / 5);
    //     } else {
    //       this.s.noFill();
    //       this.s.push();
    //       this.s.translate(0, 0, this.s.sin(this.time / 1000 + i + j) * 10);
    //       this.s.box(SCALE_UNIT, SCALE_UNIT, SCALE_UNIT / 5);
    //       this.s.pop();
    //     }
    //     this.s.pop();
    //   }
    // }
    // this.s.pop();
  }

  isValidCoordinate(coordinate: Coordinate): boolean {
    return (
      coordinate.x >= 0 &&
      coordinate.x < this.mapWidth &&
      coordinate.y >= 0 &&
      coordinate.y < this.mapHeight
    );
  }

  isValidMoveDestination(destination: Coordinate): boolean {
    // has a tile below (non-0 in map data)
    if (!this.isValidCoordinate(destination)) return false;
    if (this.mapData[destination.x][destination.y] == 0) return false;
    // not key or door position
    const gameRoot = this.gameRoot as GameRoot;
    if (
      gameRoot.keys.find((e) => e.position.equals(destination)) ||
      gameRoot.door.position.equals(destination)
    )
      return false;
    return true;
  }

  shouldDraw(): boolean {
    return true;
  }
}
