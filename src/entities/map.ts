import { GameObject } from '@/common/gameObject';
import { SCALE_UNIT } from '@/constants';
import { Coordinate } from '../common/coordinate';
import { GameRoot } from './gameRoot';

export class Map extends GameObject {
  constructor(
    // s: p5,
    gameRoot: GameObject,
    public mapData: number[][],
    public mapWidth: number,
    public mapHeight: number,
  ) {
    super(gameRoot.s, new Coordinate(0, 0), gameRoot, gameRoot);
  }

  setup(): void {
    console.log('Map setup');
  }

  _draw(): void {
    // console.log('Map draw');
    this.s.push();
    this.s.fill(145, 196, 131);
    this.s.stroke(255);
    for (let i = 0; i < this.mapWidth; i++) {
      for (let j = 0; j < this.mapHeight; j++) {
        this.s.push();
        this.s.translate(
          SCALE_UNIT * i,
          SCALE_UNIT * j,
          (-6 * SCALE_UNIT) / 10,
        );
        // TODO: uncomment to hide block further than radius
        if (
          this.s.dist(
            i,
            j,
            (this.gameRoot as GameRoot).cube.position.x,
            (this.gameRoot as GameRoot).cube.position.y,
          ) < 3
        ) {
          if (this.mapData[i][j] !== 0)
            this.s.box(SCALE_UNIT, SCALE_UNIT, SCALE_UNIT / 5);
        } else {
          this.s.noFill();
          this.s.push();
          this.s.translate(0, 0, this.s.sin(this.time / 1000 + i + j) * 10);
          this.s.box(SCALE_UNIT, SCALE_UNIT, SCALE_UNIT / 5);
          this.s.pop();
        }
        this.s.pop();
      }
    }
    this.s.pop();
  }

  shouldDraw(): boolean {
    return true;
  }
}
