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
import { GameRoot } from './entities/gameRoot';

const sketch = (s: p5) => {
  // let counter = 0;
  const gameRoot = new GameRoot(s);

  s.setup = () => {
    const canvas = s.createCanvas(s.windowWidth, s.windowHeight - 5, s.WEBGL);
    canvas.style('margin: 0px');
    gameRoot.setup();
  };

  // s.mouseClicked = () => {
  //   door.disableRing(counter);
  //   keys[counter].keyLoot(map);
  //   counter++;
  // };

  s.draw = () => {
    // time += s.deltaTime;

    // s.ortho();
    // s.camera(1, 1, 600, 0, 0, 0, 0, 0, -1);
    // const currentPos = {
    //   x: 4,
    //   y: 3,
    // };
    s.background(110);
    gameRoot.draw();
  };

  s.keyPressed = () => {
    console.log(s.keyCode);
    gameRoot.handleInput(s.keyCode);
  };
};

// const sketchInstance = new p5(sketch);
new p5(sketch);
