import { applyToMatrix } from "./utils";

export const GRID_HEIGHT = 22
export const GRID_WIDTH = 10
export const INITIAL_GRID = Array(GRID_HEIGHT).fill(null).map(() =>
    Array(GRID_WIDTH).fill(null)
)
export const insideGrid = (i, j) => i >= 0 && i < GRID_HEIGHT && j >= 0 && j < GRID_WIDTH
export const GRAVITY_TIME = 1000

export const TETROMINO_SHAPE = {
    0: "I",
    1: "O",
    2: "T",
    3: "J",
    4: "L",
    5: "S",
    6: "Z",
}

export const GHOST = "ghost"

// TODO use grid dimension
export const TETROMINO_SQUARES = {
    "I": [[0, 3], [0, 4], [0, 5], [0, 6]],
    "O": [[0, 4], [0, 5], [1, 5], [1, 4]],
    "T": [[1, 3], [1, 4], [0, 4], [1, 5]],
    "J": [[0, 3], [1, 3], [1, 4], [1, 5]],
    "L": [[1, 3], [1, 4], [1, 5], [0, 5]],
    "S": [[1, 3], [0, 4], [1, 4], [0, 5]],
    "Z": [[0, 3], [0, 4], [1, 4], [1, 5]],
}

const TETROMINO_BOX_SQUARES = Object.fromEntries(
    [...Object.entries(TETROMINO_SQUARES), [null, []]].map(([shape, squares]) =>
        [shape, squares.map(([i, j]) =>
            [i, j - TETROMINO_SQUARES[shape][0][1]]
        )]
    )
)

const BOX_HEIGHT = 2
const BOX_WIDTH = 4
const INITIAL_BOX = Array(BOX_HEIGHT).fill(null).map(() =>
    Array(BOX_WIDTH).fill(null)
)

export const TETROMINO_BOX = Object.fromEntries(
    Object.entries(TETROMINO_BOX_SQUARES).map(([shape, squares]) => {
        const box = JSON.parse(JSON.stringify(INITIAL_BOX))
        applyToMatrix(box, squares, shape)
        return [shape, box]
    })
)

export const TETROMINO_CENTER = {
    "I": [0.5, 4.5],
    "O": [0.5, 4.5],
    "T": [1, 4],
    "J": [1, 4],
    "L": [1, 4],
    "S": [1, 4],
    "Z": [1, 4],
}

export const NEXT_QUEUE_SIZE = 4

export const LEFT = "k"
export const RIGHT = "m"
export const DOWN = "l"
export const HOLD = "<"
export const DROP = " "
export const ROTATE_LEFT = "Control"
export const ROTATE_RIGHT = "o"
export const DAS = 100
export const ARR = 10

const I_KICK = {
    0: {
        1: [[-2, 0], [1, 0], [-2, -1], [1, 2]],
        3: [[-1, 0], [2, 0], [-1, 2], [2, -1]],
    },
    1: {
        2: [[-1, 0], [2, 0], [-1, 2], [2, -1]],
        0: [[2, 0], [-1, 0], [2, 1], [-1, -2]],
    },
    2: {
        3: [[2, 0], [-1, 0], [2, 1], [-1, -2]],
        1: [[1, 0], [-2, 0], [1, -2], [-2, 1]],
    },
    3: {
        0: [[1, 0], [-2, 0], [1, -2], [-2, 1]],
        2: [[-2, 0], [1, 0], [-2, -1], [1, 2]],
    }
}
const OTHER_KICK = {
    0: {
        1: [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
        3: [[1, 0], [1, 1], [0, -2], [1, -2]],
    },
    1: {
        2: [[1, 0], [1, -1], [0, 2], [1, 2]],
        0: [[1, 0], [1, -1], [0, 2], [1, 2]],
    },
    2: {
        3: [[1, 0], [1, 1], [0, -2], [1, -2]],
        1: [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
    },
    3: {
        0: [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
        2: [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
    }
}
export const SHAPE_KICK = {
    "I": I_KICK,
    "O": OTHER_KICK,
    "T": OTHER_KICK,
    "J": OTHER_KICK,
    "L": OTHER_KICK,
    "S": OTHER_KICK,
    "Z": OTHER_KICK,
}
