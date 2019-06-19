import { TETROMINO, TETROMINO_SQUARES, TETROMINO_CENTER, GRID_HEIGHT, insideGrid } from "./constants";

const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)


Array.prototype.includesSub = function (subArray) {
    return this.some(elt => JSON.stringify(elt) == JSON.stringify(subArray))
}

export default class Tetromino {
    constructor(shape, squares, center) {
        this.shape = shape
        this.squares = squares
        this.center = center
    }

    static init(shape = TETROMINO[randomRange(0, 1)]) {
        return new Tetromino(shape, TETROMINO_SQUARES[shape], TETROMINO_CENTER[shape])
    }

    collide(stack) {
        return this.squares.some(([i, j]) => stack[i][j] != null)
    }

    heightToStack(stack) {
        return Math.min(...this.squares.map(([i, j]) => {
            let height = 0
            while (i + height + 1 < GRID_HEIGHT && stack[i + height + 1][j] == null) height++
            return height
        }))
    }

    ghost(stack) {
        const height = this.heightToStack(stack)
        return this.squares.map(([i, j]) => [i + height, j])
    }

    harddrop(stack) {
        return this.move(this.heightToStack(stack), 0, stack)
    }

    move(di, dj, stack) {
        const newSquares = this.squares.map(([i, j]) => [i + di, j + dj])
        if (newSquares.some(([i, j]) => !insideGrid(i, j))) return null
        if (newSquares.some(s => stack[s[0]][s[1]] != null && !this.squares.includesSub(s))) return null
        const newCenter = [this.center[0] + di, this.center[1] + dj]
        return new Tetromino(this.shape, newSquares, newCenter)
    }
}
