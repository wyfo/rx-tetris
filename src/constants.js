export const GRID_HEIGHT = 22
export const GRID_WIDTH = 10
export const INITIAL_GRID = Array(GRID_HEIGHT).fill(null).map(() =>
    Array(GRID_WIDTH).fill(null)
)
export const insideGrid = (i, j) => i >= 0 && i < GRID_HEIGHT && j >= 0 && j < GRID_WIDTH
export const GRAVITY_TIME = 200

export const TETROMINO = {
    0: "I",
    1: "O",
    2: "T",
    3: "J",
    4: "L",
    5: "S",
    6: "L",
}

export const GHOST = "ghost"

// TODO use grid dimension
export const TETROMINO_SQUARES = {
    "I": [[0, 3], [0, 4], [0, 5], [0, 6]],
    "O": [[0, 4], [0, 5], [1, 5], [1, 4]],
}

export const TETROMINO_CENTER = {
    "I": [0.5, 4.5],
    "O": [0.5, 4.5]
}
