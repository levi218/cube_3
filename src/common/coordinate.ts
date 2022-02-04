import p5 from 'p5';

export class Coordinate extends p5.Vector {
  constructor(public x: number, public y: number, public z: number = 0) {
    super(x, y, z);
  }
}

// export type Coordinate = typeof p5.Vector;
