import { Coordinate } from '@/common/coordinate';
import { GameObject } from '@/common/gameObject';
import { KEY_COLORS } from '@/constants';
import mapGenerator, { shuffleArray } from '@/mapGenerator';
import p5 from 'p5';
import { Cube } from './cube';
import { Door } from './door';
import { Key } from './key';
import { Map } from './map';

export class GameRoot extends GameObject {
  public map: Map;
  public keys: Key[];
  public cube: Cube;
  public door: Door;
  constructor(s: p5) {
    super(s, new Coordinate(0, 0, 0));
  }
  setup(): void {
    const MAP_SIZE = 6;
    const {
      map: mapData,
      width: mapWidth,
      height: mapHeight,
      deadends,
    } = mapGenerator(MAP_SIZE, MAP_SIZE);
    // let time = 0;

    shuffleArray(deadends);
    const doorLocation = deadends.pop();
    const keyLocations =
      deadends.length > KEY_COLORS.length
        ? deadends.slice(0, KEY_COLORS.length)
        : deadends;

    this.map = new Map(this, mapData, mapWidth, mapHeight);
    this.door = new Door(
      this,
      doorLocation,
      Array(keyLocations.length).fill(true),
    );
    this.keys = keyLocations.map((pos, index) => {
      return new Key(this, index, pos);
    });
    this.cube = new Cube(this, new Coordinate(0, 0));

    this.map.setup();
    this.door.setup();
    this.keys.forEach((e) => e.setup());
    this.cube.setup();
  }
  draw(): void {
    this.map.draw();
    this.door.draw();

    this.keys.forEach((e) => e.draw());
    this.cube.draw();
  }
  handleInput(keyCode: number): void {
    this.cube.handleInput(keyCode);
  }
}
