import { withLatestFrom } from 'rxjs/operators'
import { grid$ } from './Grid';
import { Subject } from 'rxjs';

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

export class Tetromino {
    constructor(shape, squares, center) {
        this.shape = shape
        this.squares = squares
        this.center = center
    }

    static init(shape = TETROMINO[randomRange(0, 1)]) {
        return new Tetromino(shape, TETROMINO_SQUARES[shape], TETROMINO_CENTER[shape])
    }
}

export const current$ = new Subject()
current$
    .pipe(withLatestFrom(grid$))
    .subscribe(([tetro, grid]) => {
        grid = JSON.parse(JSON.stringify(grid))
        tetro.squares.forEach(([i, j]) =>
            grid[i][j] = tetro.shape
        )
        grid$.next(grid)
    })
