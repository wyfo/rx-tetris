import { withLatestFrom, pairwise, observeOn, filter, switchMap, map, shareReplay } from 'rxjs/operators'
import { Subject, interval, asyncScheduler, fromEvent, BehaviorSubject, combineLatest } from 'rxjs';
import { INITIAL_GRID, GHOST, GRAVITY_TIME } from './constants';
import Tetromino from './Tetromino';

const applyToMatrix = (matrix, pts, value) => pts.forEach(([i, j]) => matrix[i][j] = value)

export const current$ = new Subject()
const stack$ = new BehaviorSubject(INITIAL_GRID)
const notNullCurrent$ = current$.pipe(filter(c => c != null))
const nullCurrent$ = current$.pipe(filter(c => c == null))
export const grid$ = combineLatest(stack$, notNullCurrent$).pipe(
    map(([stack, current]) => {
        const grid = JSON.parse(JSON.stringify(stack))
        applyToMatrix(grid, current.ghost(stack), GHOST)
        applyToMatrix(grid, current.squares, current.shape)
        return grid
    }),
)

// Put tetromino in stack
current$.pipe(
    pairwise(),
    filter(([current, next]) => next == null),
    withLatestFrom(stack$)
).subscribe(([[current, next], stack]) => {
    const nextStack = JSON.parse(JSON.stringify(stack))
    applyToMatrix(nextStack, current.squares, current.shape)
    stack$.next(nextStack)
})

// New tetromino
nullCurrent$.pipe(
    observeOn(asyncScheduler)
).subscribe(current =>
    current$.next(Tetromino.init())
)

// Gravity
current$.pipe(
    pairwise(),
    filter(([current, next]) => current == null && next != null),
    switchMap(() => interval(GRAVITY_TIME)),
    withLatestFrom(current$),
    map(([_, current]) => current),
    filter(current => current != null),
    withLatestFrom(stack$)
).subscribe(([current, grid]) => {
    const next = current.move(1, 0, grid)
    current$.next(next)
})

// Keys
const keydown$ = fromEvent(document, 'keydown')
keydown$.pipe(
    withLatestFrom(current$, stack$),
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
