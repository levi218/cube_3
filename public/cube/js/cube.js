class CubeAnimation {
  constructor(cube, direction, offset, startCondition, onUpdate, onFinished) {
    this.cube = cube;
    this.direction = direction;
    this.offset = offset;
    this.startCondition = startCondition;
    this.isStarted = false;
    this.isFinished = false;
    this.onUpdate = onUpdate;
    this.onFinished = onFinished;
  }
  update() {
    if (!this.isStarted && (!this.startCondition || this.startCondition())) {
      this.isStarted = true;
      playSound(SOUND.ROLL, effVolume, false);
    }
    if (this.isStarted) {
      if (!this.isFinished) {
        this.cube.angle.x -= 0.15 * this.direction.y;
        this.cube.angle.y += 0.15 * this.direction.x;
        if (this.onUpdate) this.onUpdate();
      }
      if (
        abs(this.cube.angle.x) > HALF_PI ||
        abs(this.cube.angle.y) > HALF_PI
      ) {
        this.cube.pos.x += this.direction.x;
        this.cube.pos.y += this.direction.y;
        this.cube.angle.x = 0;
        this.cube.angle.y = 0;
        this.cube.updateSide(this.direction);
        this.isFinished = true;
        if (this.onFinished) this.onFinished();
      }
    }
  }
}
var movementDirections = [
  { x: 0, y: +1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: -1, y: 0, z: 0 },
];
var cellOffset = [
  new p5.Vector(-1, 1, -1),
  new p5.Vector(1, 1, -1),
  new p5.Vector(1, -1, -1),
  new p5.Vector(-1, -1, -1),
];
var cube = {
  pos: {
    x: 0,
    y: 0,
    z: 0,
  },
  hp: 100,
  angle: { x: 0, y: 0 },
  facing: new p5.Vector(0, 0, -1),
  animation: null,
  init(map) {
    let path_start = map.arr[0];
    this.pos.x = path_start.x;
    this.pos.y = path_start.y;
    this.pos.z = path_start.z + 1;
  },
  update() {
    if (this.animation) {
      this.animation.update();
      if (this.animation.isFinished) this.animation = null;
    }
  },
  draw() {
    // draw cube
    push();
    noStroke();
    // stroke(0)
    translate(
      this.pos.x * CUBE_SIZE,
      this.pos.y * CUBE_SIZE,
      this.pos.z * CUBE_SIZE,
    );
    if (this.isOnStair && (!this.animation || !this.animation.isStarted)) {
      translate(0, 0, this.stairing.height);
      box(CUBE_SIZE - 1, CUBE_SIZE - 1, CUBE_SIZE - 1);
      line(0, 0, 0, this.facing.x * 70, this.facing.y * 70, this.facing.z * 70);
    } else {
      if (this.animation)
        translate(
          this.animation.offset.x,
          this.animation.offset.y,
          this.animation.offset.z,
        );
      rotateX(this.angle.x);
      rotateY(this.angle.y);
      if (this.animation)
        translate(
          -this.animation.offset.x,
          -this.animation.offset.y,
          -this.animation.offset.z,
        );
      box(CUBE_SIZE - 1, CUBE_SIZE - 1, CUBE_SIZE - 1);
      line(0, 0, 0, this.facing.x * 70, this.facing.y * 70, this.facing.z * 70);
    }
    push();
    noStroke();
    let lazerPhase = sin(t / (score < 45 ? 45.0 - score : 1));
    emissiveMaterial(30, 30, 30, map(lazerPhase, -1, 1, 0, 255));
    translate(
      (this.facing.x * CUBE_SIZE) / 2,
      (this.facing.y * CUBE_SIZE) / 2,
      (this.facing.z * CUBE_SIZE) / 2,
    );
    if (this.facing.z != 0) {
      rotateX(PI / 2);
    }
    if (this.facing.x != 0) {
      rotateZ(PI / 2);
    }
    box(CUBE_SIZE / 4, 5, CUBE_SIZE / 4);
    if (this.facing.x == 0 && this.facing.y == 0 && this.facing.z == 1) {
      if (lazerPhase > 0.9) {
        if (!this.damaged) {
          this.damaged = true;
          this.hp -= 5;
          updateHp(this.hp);
        }
        // draw
        translate(0, 250, 0);
        emissiveMaterial(255, 0, 0, map(lazerPhase, 0.95, 1, 100, 255));
        cylinder(CUBE_SIZE / 20, 500);
      } else {
        this.damaged = false;
      }
    }
    pop();
    pop();
  },
  updateSide(direction) {
    // console.log((new p5.Vector(direction.x, direction.y).cross(new p5.Vector(0,0,1)).dot(this.facing)))
    if (
      new p5.Vector(direction.x, direction.y)
        .cross(new p5.Vector(0, 0, 1))
        .dot(this.facing) == 0
    ) {
      //rolling affects facing
      if (direction.x == 1)
        this.facing = this.facing.cross(new p5.Vector(0, -1, 0));
      if (direction.x == -1)
        this.facing = this.facing.cross(new p5.Vector(0, 1, 0));
      if (direction.y == 1)
        this.facing = this.facing.cross(new p5.Vector(1, 0, 0));
      if (direction.y == -1)
        this.facing = this.facing.cross(new p5.Vector(-1, 0, 0));
      // console.log(this.facing);
    } else {
      // not affects
      // console.log("not")
    }
  },
  move(direction, condition, onUpdate, onFinished) {
    // direction = {x,y,z}
    if (this.animation) {
      if (!this.animation.isStarted) {
        this.animation = null;
      } else return;
    }
    // check z, choose animation, generate and add animation to array
    let offset = {
      x: (direction.x * CUBE_SIZE) / 2,
      y: (direction.y * CUBE_SIZE) / 2,
      z: ((direction.z - 1) * CUBE_SIZE) / 2,
    };

    this.animation = new CubeAnimation(
      this,
      direction,
      offset,
      condition,
      onUpdate,
      onFinished,
    );
  },
  handleInput(keyCode) {
    let direction = null;
    switch (keyCode) {
      case 65:
      case LEFT_ARROW:
        direction = movementDirections[(DIR.LEFT + cameraOffsetIndex) % 4];
        break;
      case 68:
      case RIGHT_ARROW:
        direction = movementDirections[(DIR.RIGHT + cameraOffsetIndex) % 4];
        break;
      case 83:
      case DOWN_ARROW:
        direction = movementDirections[(DIR.DOWN + cameraOffsetIndex) % 4];
        break;
      case 87:
      case UP_ARROW:
        direction = movementDirections[(DIR.UP + cameraOffsetIndex) % 4];
        break;
    }
    if (direction) {
      let x = this.pos.x + direction.x;
      let y = this.pos.y + direction.y;
      let z = this.pos.z;
      // console.log(x + " " + y + " " + z)
      if (!this.stairing) {
        if (
          gameMap.isValidCoordinate(x, y, z - 1) &&
          gameMap.isValidCoordinate(x, y, z)
        ) {
          // move to the stair at lower level
          if (gameMap.isStair(x, y, z)) {
            // this.stairing = gameMap.arr[z][x][y];
            let target = gameMap.arr[z][x][y];
            this.move(
              direction,
              function () {
                // start condition
                if (target.height < 5) this.stairing = target;
                return target.height < 5;
              }.bind(this),
              function () {
                // every update frame
                this.stairing.phase = 0.0001;
              }.bind(this),
              function () {
                // on animation ended
                this.pos.z = z;
                this.isOnStair = true;
                this.onMoveFinished();
              }.bind(this),
            );
          } else if (gameMap.isStair(x, y, z - 1)) {
            // move to the stair at upper level
            // this.stairing = gameMap.arr[z - 1][x][y];
            let target = gameMap.arr[z - 1][x][y];
            this.move(
              direction,
              function () {
                // see above
                if (target.height > CUBE_SIZE - 5) this.stairing = target;
                return target.height > CUBE_SIZE - 5;
              }.bind(this),
              function () {
                this.stairing.phase = HALF_PI;
              }.bind(this),
              function () {
                this.pos.z = z - 1;
                this.isOnStair = true;
                this.onMoveFinished();
              }.bind(this),
            );
          }
          // move on the same level
          else if (gameMap.isEmpty(x, y, z)) {
            if (!gameMap.isEmpty(x, y, z - 1)) {
              this.move(direction, null, null, this.onMoveFinished.bind(this));
            } else {
              // try to move in player's perception
              let destination = new p5.Vector(x, y, z - 1);
              let offset = cellOffset[cameraOffsetIndex];
              let found = null;
              for (let i = 1; i < 10; i++) {
                let c = p5.Vector.add(destination, p5.Vector.mult(offset, i));
                if (!gameMap.isEmpty(c.x, c.y, c.z)) {
                  found = c;
                  break;
                }
              }
              if (found) {
                this.move(
                  direction,
                  null,
                  null,
                  function () {
                    this.pos.x = found.x;
                    this.pos.y = found.y;
                    this.pos.z = found.z + 1;
                    this.onMoveFinished();
                  }.bind(this),
                );
              } else {
                for (let i = -10; i < 0; i++) {
                  let c = p5.Vector.add(destination, p5.Vector.mult(offset, i));
                  if (!gameMap.isEmpty(c.x, c.y, c.z)) {
                    found = c;
                    break;
                  }
                }
                if (found) {
                  this.move(
                    direction,
                    function () {
                      this.pos.x = found.x - direction.x;
                      this.pos.y = found.y - direction.y;
                      this.pos.z = found.z + 1;
                      return true;
                    }.bind(this),
                    null,
                    function () {
                      this.onMoveFinished();
                    }.bind(this),
                  );
                }
              }
            }
          }
        }
      } else {
        // move out of the stair at lower level
        if (
          gameMap.isValidCoordinate(x, y, z) &&
          gameMap.isEmpty(x, y, z) &&
          gameMap.isValidCoordinate(x, y, z - 1) &&
          gameMap.isSolid(x, y, z - 1)
        ) {
          this.move(
            direction,
            function () {
              // see above
              return this.stairing.height < 5;
            }.bind(this),
            function () {
              this.stairing.phase = 0.0001;
            }.bind(this),
            function () {
              this.stairing = null;
              this.isOnStair = false;
              this.onMoveFinished();
            }.bind(this),
          );
        }
        // move out of the stair at upper level
        else if (
          gameMap.isValidCoordinate(x, y, z + 1) &&
          gameMap.isEmpty(x, y, z + 1) &&
          gameMap.isValidCoordinate(x, y, z) &&
          gameMap.isSolid(x, y, z)
        ) {
          this.move(
            direction,
            function () {
              // see above
              if (this.stairing.height > CUBE_SIZE - 5) {
                this.pos.z = z + 1;
              }
              return this.stairing.height > CUBE_SIZE - 5;
            }.bind(this),
            function () {
              this.stairing.phase = HALF_PI;
            }.bind(this),
            function () {
              this.stairing = null;
              this.isOnStair = false;
              this.onMoveFinished();
            }.bind(this),
          );
        }

        // move out of the stair to another same level stair
        else if (
          gameMap.isValidCoordinate(x, y, z + 1) &&
          gameMap.isEmpty(x, y, z + 1) &&
          gameMap.isValidCoordinate(x, y, z) &&
          gameMap.isStair(x, y, z)
        ) {
          let freezePhase1;
          let freezePhase2;

          this.move(
            direction,
            function () {
              // see above
              if (abs(this.stairing.height - gameMap.arr[z][x][y].height) < 5) {
                freezePhase1 = this.stairing.phase;
                freezePhase2 = gameMap.arr[z][x][y].phase;
              }
              return (
                abs(this.stairing.height - gameMap.arr[z][x][y].height) < 5
              );
            }.bind(this),
            function () {
              this.stairing.phase = freezePhase1;
              gameMap.arr[z][x][y].phase = freezePhase2;
              this.pos.z = z + this.stairing.height / CUBE_SIZE;
            }.bind(this),
            function () {
              this.pos.z = z;
              this.stairing = gameMap.arr[z][x][y];
              this.isOnStair = true;
              this.onMoveFinished();
            }.bind(this),
          );
        }
      }
    }
  },

  onMoveFinished() {
    if (
      this.pos.x == door.x &&
      this.pos.y == door.y &&
      this.pos.z == door.z + 1
    ) {
      initGame();
    }
  },
};
