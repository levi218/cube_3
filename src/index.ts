// // Import helpers.
// import { setMessage } from '@/helpers/set-message';

// /**
//  * Will find #root element and set HTML to "Hello World!".
//  */
// function editDom(): void {
//   const root = document.getElementById('root'); // Get root element.
//   if (root) {
//     root.innerHTML = `<p>${setMessage()}</p>`; // Set html of the root element.
//   }
// }

// editDom(); // Call editDom.
import p5 from 'p5';
import mapGenerator, { shuffleArray } from './mapGenerator';
import { KEY_COLORS, SCALE_UNIT } from './constants';
import { Map } from './entities/map';
import { Door } from './entities/door';
import { Key } from './entities/key';

const sketch = (s: p5) => {
  const MAP_SIZE = 6;
  const {
    map: mapData,
    width: mapWidth,
    height: mapHeight,
    deadends,
  } = mapGenerator(MAP_SIZE, MAP_SIZE);
  let time = 0;

  shuffleArray(deadends);
  const doorLocation = deadends.pop();
  const keyLocations =
    deadends.length > KEY_COLORS.length
      ? deadends.slice(0, KEY_COLORS.length)
      : deadends;

  const map = new Map(s, mapData, mapWidth, mapHeight);
  const door = new Door(s, doorLocation, Array(keyLocations.length).fill(true));
  const keys = keyLocations.map((pos, index) => {
    return new Key(s, index, pos);
  });

  let counter = 0;

  s.setup = () => {
    const canvas = s.createCanvas(s.windowWidth, s.windowHeight - 5, s.WEBGL);
    canvas.style('margin: 0px');
    map.setup();
    door.setup();
    keys.forEach((e) => e.setup());
  };

  s.mouseClicked = () => {
    door.disableRing(counter);
    keys[counter].keyLoot(map);
    counter++;
  };

  s.draw = () => {
    time += s.deltaTime;
    s.camera(-400, -400, 2500, 0, 0, 0, 0, 0, -1);
    // s.ortho();
    // s.camera(1, 1, 600, 0, 0, 0, 0, 0, -1);
    // const currentPos = {
    //   x: 4,
    //   y: 3,
    // };
    s.background(110);

    map.draw();

    keys.forEach((e) => e.draw());
    door.draw();

    // CUBE
    s.stroke(255);
    s.fill(255, 102, 94);
    s.box(SCALE_UNIT);
    // CUBE's EYE WITH FIELD OF VISION
    s.push();
    s.rotateZ(time / 1000);
    s.translate(0, 0, SCALE_UNIT / 2 + 20 + s.sin(time / 700) * 5);
    s.stroke(255, 255, 0);
    s.noFill();
    s.torus(15, 3, 4, 3);
    s.pop();

    s.push();
    s.noFill();
    s.rotateZ(-time / 1000);
    s.translate(0, 0, SCALE_UNIT / 2 + 15 - s.sin(time / 1000) * 5);
    s.torus(20, 3, 6, 3);
    s.pop();

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
  };
};

// const sketchInstance = new p5(sketch);
new p5(sketch);
