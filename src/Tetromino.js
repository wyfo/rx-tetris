import { TETROMINO_SQUARES, TETROMINO_CENTER, GRID_HEIGHT, insideGrid, SHAPE_KICK } from "./constants";

const collide = (stack, squares) => squares.some(([i, j]) => stack[i][j] != null)

const validate = (stack, squares) => squares.every(([i, j]) => insideGrid(i, j)) && !collide(stack, squares)

export default class Tetromino {
    constructor(shape, squares, center, state) {
        this.shape = shape
        this.squares = squares
        this.center = center
        this.state = state
    }

    static init(shape, stack) {
        const squares = TETROMINO_SQUARES[shape]
        if (collide(stack, squares)) return null
        else return new Tetromino(shape, squares, TETROMINO_CENTER[shape], 0)
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

    move(di, dj, stack) {
        const newSquares = this.squares.map(([i, j]) => [i + di, j + dj])
        if (!validate(stack, newSquares)) return null
        const newCenter = [this.center[0] + di, this.center[1] + dj]
        return new Tetromino(this.shape, newSquares, newCenter, this.state)
    }

    rotate(sign, stack) {
        console.assert(sign === 1 || sign === -1)
        const newState = (this.state + sign + 4) % 4
        const [ci, cj] = this.center
        const newSquares = this.squares.map(([i, j]) =>
            [ci + sign * (j - cj), cj + sign * (ci - i)]
        )
        const kicks = SHAPE_KICK[this.shape][this.state][newState]
        const tries = [[0, 0], ...kicks]
        for (let [x, y] of tries) {
            const offsetSquares = newSquares.map(([i, j]) => [i - y, j + x])
            if (validate(stack, offsetSquares)) {
                const newCenter = [ci - y, cj + x]
                return new Tetromino(this.shape, offsetSquares, newCenter, newState)
            }
        }
        return null
    }
}
