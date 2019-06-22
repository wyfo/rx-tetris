import { TETROMINO_SQUARES, TETROMINO_CENTER, GRID_HEIGHT, insideGrid } from "./constants";

const collide = (stack, squares) => squares.some(([i, j]) => stack[i][j] != null)

export default class Tetromino {
    constructor(shape, squares, center) {
        this.shape = shape
        this.squares = squares
        this.center = center
    }

    static init(shape) {
        return new Tetromino(shape, TETROMINO_SQUARES[shape], TETROMINO_CENTER[shape])
    }

    collide(stack) {
        return collide(stack, this.squares)
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
        if (newSquares.some(([i, j]) => !insideGrid(i, j)) || collide(stack, newSquares)) return null
        const newCenter = [this.center[0] + di, this.center[1] + dj]
        return new Tetromino(this.shape, newSquares, newCenter)
    }

    rotateLeft(stack) {
        const [ci, cj] = this.center
        const newSquares = this.squares.map(([i, j]) =>
            [cj - j + ci, i - ci + cj]
        )
        if (newSquares.some(([i, j]) => !insideGrid(i, j)) || collide(stack, newSquares)) return null
        return new Tetromino(this.shape, newSquares, this.center)
    }
    rotateRight(stack) {
        const [ci, cj] = this.center
        const newSquares = this.squares.map(([i, j]) =>
            [j - cj + ci, ci - i + cj]
        )
        if (newSquares.some(([i, j]) => !insideGrid(i, j)) || collide(stack, newSquares)) return null
        return new Tetromino(this.shape, newSquares, this.center)
    }
}
