
class Cell {
    constructor(x, y, z, type = CELL.EMPTY, phase = Math.random() * PI) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.phase = phase;
    }
    get height() {
        switch (this.type) {
            case CELL.EMPTY:
                return 0;
            case CELL.FILL:
                return CUBE_SIZE;
            case CELL.STAIR:
                return CUBE_SIZE * abs(sin(this.phase))
        }
    }
    draw(colorId) {
        push();
        translate(this.x * CUBE_SIZE, this.y * CUBE_SIZE, this.z * CUBE_SIZE);
        noStroke()
        switch (this.type) {
            case CELL.EMPTY:
                break;
            case CELL.FILL:
                ambientMaterial(primaryColor[colorId][0], primaryColor[colorId][1], primaryColor[colorId][2]); // TODO: color to global array
                box(CUBE_SIZE);
                break;
            case CELL.STAIR:
                ambientMaterial(primaryColor[colorId][0] - 30, primaryColor[colorId][1] - 30, primaryColor[colorId][2] - 30);
                let offset = (CUBE_SIZE - this.height) / 2
                translate(0, 0, -offset);
                box(CUBE_SIZE, CUBE_SIZE, this.height);// ;
                this.phase += 0.02;
                break;
        }
        pop();
    }
}
function randInt(limit) {
    return Math.floor(Math.random() * limit);
}
class GameMap {
    constructor(mapData, color) {
        if (!mapData) {
            // random color mode
            this.color = randInt(primaryColor.length);
            if (!score) score = 0;
            let destinatedPathLength = (10 + score) > 50 ? 50 : (10 + score);
            let m_mutation = destinatedPathLength/4;
            this.clearMap();
            this.travelMap(0, 0, 0, { value: 0 }, 0, destinatedPathLength);
            this.finalizeMap(m_mutation);
        } else {
            // load color
            this.color = color;
            this.arr = mapData;

            for (let i = 0; i < this.arr.length; i++) {
                this.arr[i] =
                    new Cell(
                        this.arr[i].x,
                        this.arr[i].y,
                        this.arr[i].z,
                        this.arr[i].type,
                        this.arr[i].phase
                    )
            }
        }
    }
    clearMap() {
        this.arr = [];
        // for (let z = 0; z < this.size.z; z++) {
        //     let layer = []
        //     for (let x = 0; x < this.size.x; x++) {
        //         let col = [];
        //         for (let y = 0; y < this.size.y; y++) {
        //             col.push(new Cell(x, y, z));
        //         }
        //         layer.push(col)
        //     }
        //     this.arr.push(layer)
        // }
        // this.arr[0][0][0].type = CELL.FILL;
    }
    // init() {

    //     // let destinatedPathLength = 40
    //     this.clearMap();
    //     this.travelMap(0, 0, 0, { value: 0 }, 0,destinatedPathLength);
    //     this.finalizeMap();
    // }
    isValidCoordinate(x, y, z) {
        return true;
    }
    isValidCoordinateBlock(x, y, z) {
        return true;
    }
    isEmpty(x, y, z) {
        return !this.arr.some(cell => (cell.x == x && cell.y == y && cell.z == z));
    }
    isSolid(x, y, z) {
        return this.arr.some(cell => cell.x == x && cell.y == y && cell.z == z && cell.type == CELL.FILL);
    }
    isStair(x, y, z) {
        return this.arr.some(cell => cell.x == x && cell.y == y && cell.z == z && cell.type == CELL.STAIR);
    }

    isUnblockedVertically(x, y, z) {
        return (!this.isValidCoordinateBlock(x, y, z - 1) || (this.isEmpty(x, y, z - 1) && !this.isStair(x, y, z - 1))) && (!this.isValidCoordinateBlock(x, y, z + 1) || (this.isEmpty(x, y, z + 1) && !this.isStair(x, y, z + 1)))
    }
    isTravelable(x, y, z) {
        return this.isValidCoordinateBlock(x, y, z) && this.isEmpty(x, y, z) //&& isUnblockedVertically(x,y,z);
    }

    travelMap(x, y, z, pathLength, sameLayerLength, destinatedPathLength, prev) {
        let possibleMoves = [];

        if (!pathLength) pathLength = { value: 0 };
        if (pathLength.value < destinatedPathLength) {
            possibleMoves = [];
            if (this.isTravelable(x + 1, y, z) && this.isTravelable(x + 1, y + 1, z) && this.isTravelable(x + 1, y - 1, z) && this.isTravelable(x + 2, y, z)) possibleMoves.push({ x: x + 1, y: y, z: z });
            if (this.isTravelable(x, y + 1, z) && this.isTravelable(x + 1, y + 1, z) && this.isTravelable(x - 1, y + 1, z) && this.isTravelable(x, y + 2, z)) possibleMoves.push({ x: x, y: y + 1, z: z });
            if (this.isTravelable(x - 1, y, z) && this.isTravelable(x - 1, y + 1, z) && this.isTravelable(x - 1, y - 1, z) && this.isTravelable(x - 2, y, z)) possibleMoves.push({ x: x - 1, y: y, z: z });
            if (this.isTravelable(x, y - 1, z) && this.isTravelable(x + 1, y - 1, z) && this.isTravelable(x - 1, y - 1, z) && this.isTravelable(x - 2, y, z)) possibleMoves.push({ x: x, y: y - 1, z: z });
            if (possibleMoves.length == 0) return false;
            let move = possibleMoves[randInt(possibleMoves.length)];
            pathLength.value += 1;
            let newCell = new Cell(move.x, move.y, move.z, CELL.FILL);
            newCell.id = pathLength.value;
            this.arr.push(newCell)
            if (prev) {
                prev.next = newCell;
                newCell.prev = prev;
            }
            if (pathLength.value == 20) {
                newCell.type = CELL.PATH_END;
            } else {
                this.travelMap(move.x, move.y, move.z, pathLength, sameLayerLength + 1, destinatedPathLength, newCell);
            }
        }

        // if (pathLength.value >= destinatedPathLength && sameLayerLength>=1)
        //     this.arr[z][x][y].type = CELL.PATH_END;
        // else
        // while (true) {
        //     possibleMoves = [];
        //     if (this.isTravelable(x + 1, y, z) && this.isUnblockedVertically(x + 1, y, z)) possibleMoves.push({ x: x + 1, y: y, z: z });
        //     if (this.isTravelable(x, y + 1, z) && this.isUnblockedVertically(x, y + 1, z)) possibleMoves.push({ x: x, y: y + 1, z: z });
        //     if (this.isTravelable(x - 1, y, z) && this.isUnblockedVertically(x - 1, y, z)) possibleMoves.push({ x: x - 1, y: y, z: z });
        //     if (this.isTravelable(x, y - 1, z) && this.isUnblockedVertically(x, y - 1, z)) possibleMoves.push({ x: x, y: y - 1, z: z });
        //     if (sameLayerLength > 4) {
        //         // up
        //         if (this.isTravelable(x, y, z + 1)
        //             && (!this.isValidCoordinateBlock(x, y, z + 2) || (this.isEmpty(x, y, z + 2) && !this.isStair(x, y, z + 2)))
        //         ) possibleMoves.push({ x: x, y: y, z: z + 1 });
        //         // down
        //         if (this.isTravelable(x, y, z - 1)
        //             && (!this.isValidCoordinateBlock(x, y, z - 2) || (this.isEmpty(x, y, z - 2) && !this.isStair(x, y, z - 2)))
        //         ) possibleMoves.push({ x: x, y: y, z: z - 1 });
        //     }
        //     if (possibleMoves.length == 0) return false;
        //     let move = possibleMoves[randInt(possibleMoves.length)];
        //     pathLength.value += 1;
        //     this.arr[move.z][move.x][move.y].id = pathLength.value;
        //     if (move.z > z) { // up
        //         this.arr[move.z][move.x][move.y].type = CELL.STAIR;
        //         this.travelMap(move.x, move.y, move.z, pathLength, 0,destinatedPathLength);
        //     } else if (move.z < z) { // down
        //         this.arr[z][x][y].type = CELL.STAIR;
        //         this.arr[move.z][move.x][move.y].type = CELL.FILL;
        //         this.travelMap(move.x, move.y, move.z, pathLength, 0,destinatedPathLength);
        //     }
        //     else {
        //         this.arr[move.z][move.x][move.y].type = CELL.FILL;
        //         this.travelMap(move.x, move.y, move.z, pathLength, sameLayerLength + 1,destinatedPathLength);
        //     }
        // }

    }
    finalizeMap(n_mutation) {
        for (let i = 0; i < n_mutation; i++) {
            let ele = this.arr[randInt(this.arr.length)];

            this.mutate(ele)

        }
        this.arr.forEach(c=>{
            c.next = null;
            c.prev = null;
        })
        let path_end = this.arr[this.arr.length - 1];
        door.init(path_end.x, path_end.y, path_end.z);
        // for (let z = 0; z < this.size.z; z++) {
        //     for (let x = 0; x < this.size.x; x++) {
        //         for (let y = 0; y < this.size.y; y++) {
        //             switch (this.arr[z][x][y].type) {
        //                 case CELL.PATH_END:
        //                     this.arr[z][x][y].type = CELL.FILL;
        //                     door.init(x, y, z);
        //                     break;

        //             }
        //         }
        //     }
        // }
    }
    mutate(c) {
        if (!c.mutated) {
            c.mutated = true;
            if (!c.prev) return;
            let forward = new p5.Vector(c.x - c.prev.x, c.y - c.prev.y, c.z - c.prev.z)
            let down = new p5.Vector(0, 0, -1);
            let side = p5.Vector.cross(forward, down).normalize().mult(randInt(2) == 0 ? -1 : 1);

            let dir = p5.Vector.add(down, side).add(forward);

            let cur = c;
            while (cur) {
                cur.x += dir.x;
                cur.y += dir.y;
                cur.z += dir.z;
                cur = cur.next;
            }
        }
    }
    draw() {
        // draw map
        this.arr.forEach(cell => cell.draw(this.color));

    }
}