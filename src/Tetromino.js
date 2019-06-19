import { withLatestFrom, pairwise, observeOn, filter, switchMap, map } from 'rxjs/operators'
import { grid$, GRID_HEIGHT, insideGrid } from './Grid';
import { Subject, interval, asyncScheduler, fromEvent } from 'rxjs';
import { GRAVITY_TIME } from './gravity';

const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const TETROMINO = {
    0: "I",
    1: "O",
    2: "T",
    3: "J",
    4: "L",
    5: "S",
    6: "L",
}

// TODO use grid dimension
const TETROMINO_SQUARES = {
    "I": [[0, 3], [0, 4], [0, 5], [0, 6]],
    "O": [[0, 4], [0, 5], [1, 5], [1, 4]],
}

const TETROMINO_CENTER = {
    "I": [0.5, 4.5],
    "O": [0.5, 4.5]
}

Array.prototype.includesSub = function (subArray) {
    return this.some(elt => JSON.stringify(elt) == JSON.stringify(subArray))
}

export class Tetromino {
    constructor(shape, squares, center) {
        this.shape = shape
        this.squares = squares
        this.center = center
    }

    static init(shape = TETROMINO[randomRange(0, 1)]) {
        return new Tetromino(shape, TETROMINO_SQUARES[shape], TETROMINO_CENTER[shape])
    }

    collide(grid) {
        return this.squares.some(([i, j]) => grid[i][j] != null)
    }

    harddrop(grid) {
        const withEmptyBelow = this.squares.filter(([i, j]) => i < (GRID_HEIGHT - 1) && grid[i + 1][j] == null)
        if (withEmptyBelow.length == 0) return null
        console.log(withEmptyBelow)
        const maxH = Math.min(...withEmptyBelow.map(([i, j]) => {
            for (let k = i + 1; k < GRID_HEIGHT; ++k) if (grid[k][j] != null) return k - i - 1
            return GRID_HEIGHT - i - 1
        }))
        console.log(maxH)
        console.assert(maxH > 0)
        return this.move(maxH, 0, grid)
    }

    move(di, dj, grid) {
        const newSquares = this.squares.map(([i, j]) => [i + di, j + dj])
        if (newSquares.some(([i, j]) => !insideGrid(i, j))) return null
        if (newSquares.some(s => grid[s[0]][s[1]] != null && !this.squares.includesSub(s))) return null
        const newCenter = [this.center[0] + di, this.center[1] + dj]
        return new Tetromino(this.shape, newSquares, newCenter)
    }
}

export const current$ = new Subject()
current$.pipe(
    pairwise(),
    withLatestFrom(grid$)
).subscribe(([[current, next], grid]) => {
    if (next == null) return
    grid = JSON.parse(JSON.stringify(grid))
    if (current != null) current.squares.forEach(([i, j]) =>
        grid[i][j] = null
    )
    next.squares.forEach(([i, j]) =>
        grid[i][j] = next.shape
    )
    grid$.next(grid)
})
current$.pipe(
    filter(c => c == null),
    observeOn(asyncScheduler)
).subscribe(current =>
    current$.next(Tetromino.init())
)
current$.pipe(
    pairwise(),
    filter(([current, next]) => current == null && next != null),
    switchMap(() => interval(GRAVITY_TIME)),
    withLatestFrom(current$),
    map(([_, current]) => current),
    filter(current => current != null),
    withLatestFrom(grid$)
).subscribe(([current, grid]) => {
    const next = current.move(1, 0, grid)
    current$.next(next)
})

const keydown$ = fromEvent(document, 'keydown')
keydown$.pipe(
    withLatestFrom(current$, grid$),
    filter(([ev, current, grid]) => current != null)
).subscribe(([ev, current, grid]) => {
    const key = ev.keyCode
    if (key == 32) {
        const next = current.harddrop(grid)
        if (next != null) current$.next(next)
        current$.next(null)
    } else if (key == 37) {
        const next = current.move(0, -1, grid)
        if (next != null) current$.next(next)
    } else if (key == 39) {
        const next = current.move(0, 1, grid)
        if (next != null) current$.next(next)
    } else if (key == 40) {
        const next = current.move(1, 0, grid)
        if (next != null) current$.next(next)
    }
})
