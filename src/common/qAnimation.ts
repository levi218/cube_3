import p5 from 'p5';
import { GameObject } from './gameObject';

export class QAnimation {
  isDone = false;
  constructor(public s: p5, public gameObject: GameObject) {}
  animate(): void {
    // console.log('animate');
  }
  finish(): void {
    this.isDone = true;
  }
}
