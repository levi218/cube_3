import { Coordinate } from './entities/coordinate';

enum DirectionName {
  UP = 'UP',
  RIGHT = 'RIGHT',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
}

const getOpposite = (dir: DirectionName) => {
  switch (dir) {
    case DirectionName.UP:
      return DirectionName.DOWN;
    case DirectionName.DOWN:
      return DirectionName.UP;
    case DirectionName.LEFT:
      return DirectionName.RIGHT;
    case DirectionName.RIGHT:
      return DirectionName.LEFT;
  }
};
class MazeCellLogic {
  [DirectionName.UP] = false;
  [DirectionName.DOWN] = false;
  [DirectionName.LEFT] = false;
  [DirectionName.RIGHT] = false;
  visited = false;
  deadend = false;

  toString() {
    return `| ${this[DirectionName.UP] ? 'U' : ' '}${
      this[DirectionName.DOWN] ? 'D' : ' '
    }${this[DirectionName.LEFT] ? 'L' : ' '}${
      this[DirectionName.RIGHT] ? 'R' : ' '
    }${this.visited ? 'v' : ' '}`;
  }
}

type MazeMap = MazeCellLogic[][];

const createEmptyMap = (width: number, height: number): MazeMap => {
  const map = [];
  for (let i = 0; i < height; i++) {
    map.push(
      Array(width)
        .fill(undefined)
        .map(() => new MazeCellLogic()),
    );
  }
  return map;
};

const RELATIVE_DIRECTION = {
  [DirectionName.UP]: { x: 0, y: -1 },
  [DirectionName.RIGHT]: { x: 1, y: 0 },
  [DirectionName.DOWN]: { x: 0, y: 1 },
  [DirectionName.LEFT]: { x: -1, y: 0 },
};

export function shuffleArray(array: unknown[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

const isValidCoordinate = (
  x: number,
  y: number,
  width: number,
  height: number,
) => x >= 0 && x < width && y >= 0 && y < height;

const randomWalk = (map: MazeCellLogic[][], x: number, y: number): void => {
  const mapHeight = map.length;
  const mapWidth = map[0].length;
  printMap(map);
  const walkDirs = Object.values(DirectionName).slice(0);
  shuffleArray(walkDirs);
  map[y][x].visited = true;
  let followedDir = 0;
  walkDirs.forEach((dirName) => {
    const dir = RELATIVE_DIRECTION[dirName];
    const newX = x + dir.x;
    const newY = y + dir.y;
    console.log(dirName, x, y, newX, newY);
    if (
      isValidCoordinate(newX, newY, mapWidth, mapHeight) &&
      !map[newY][newX].visited
    ) {
      followedDir += 1;
      map[y][x][dirName] = true;
      map[newY][newX][getOpposite(dirName)] = true;
      randomWalk(map, newX, newY);
    }
  });
  if (followedDir == 0) {
    map[y][x].deadend = true;
  }
};

const mapExpand = (map: MazeCellLogic[][]): number[][] => {
  const mapHeight = map.length;
  const mapWidth = map[0].length;
  const newMap = [];
  for (let i = 0; i < mapHeight; i++) {
    const row = [];
    // expand horizontally
    for (let j = 0; j < mapWidth; j++) {
      if (!map[i][j].deadend) {
        row.push(1);
      } else {
        row.push(2);
      }
      if (j !== mapWidth - 1) {
        row.push(map[i][j].RIGHT ? 1 : 0);
      }
    }
    newMap.push(row);
    // expand vertically
    if (i !== mapHeight - 1) {
      const additionalRow = [];
      for (let j = 0; j < mapWidth; j++) {
        additionalRow.push(map[i][j].DOWN ? 1 : 0);
        if (j !== mapWidth - 1) {
          additionalRow.push(0);
        }
      }
      newMap.push(additionalRow);
    }
  }
  return newMap;
};

const generateSpace = (map: number[][]): number[][] => {
  const numberOfHorizontalDuplicates = 1;
  const numberOfVerticalDuplicates = 1;
  for (let i = 0; i < numberOfHorizontalDuplicates; i++) {
    const pos = Math.floor((Math.random() * map.length) / 2) * 2;
    map.splice(
      pos,
      0,
      (JSON.parse(JSON.stringify(map[pos])) as number[]).map((e) =>
        e == 2 ? 1 : e,
      ),
    );
  }

  for (let i = 0; i < numberOfVerticalDuplicates; i++) {
    const pos = Math.floor((Math.random() * map[0].length) / 2) * 2;
    for (let j = 0; j < map.length; j++)
      map[j].splice(pos, 0, map[j][pos] === 2 ? 1 : map[j][pos]);
  }
  return map;
};

const printMap = (map: (number | MazeCellLogic)[][]) => {
  for (let i = 0; i < map.length; i++) {
    let s = '';
    for (let j = 0; j < map[0].length; j++) {
      s += map[i][j].toString();
    }
    console.log(s);
  }
};

const separateDeadends = (map: number[][]): Coordinate[] => {
  const deadends = [];
  const mapHeight = map.length;
  const mapWidth = map[0].length;
  for (let i = 0; i < mapHeight; i++) {
    for (let j = 0; j < mapWidth; j++) {
      if (map[i][j] === 2) {
        map[i][j] = 1;
        deadends.push(new Coordinate(i, j));
      }
    }
  }
  return deadends;
};

const generateMap = (
  widthBase: number,
  heightBase: number,
): {
  map: number[][];
  width: number;
  height: number;
  deadends: Coordinate[];
} => {
  const emptyMap = createEmptyMap(widthBase, heightBase);
  randomWalk(emptyMap, 0, 0);
  //   printMap(map);
  const expandedMap = mapExpand(emptyMap);
  generateSpace(expandedMap);
  return {
    map: expandedMap,
    width: expandedMap.length,
    height: expandedMap[0].length,
    deadends: separateDeadends(expandedMap),
  };
};

export default generateMap;
// printMap(generateMap());
