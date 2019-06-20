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
    filter(([_, current]) => current == null),
    withLatestFrom(stack$)
).subscribe(([[prev, _], stack]) => {
    let nextStack = JSON.parse(JSON.stringify(stack))
    applyToMatrix(nextStack, prev.squares, prev.shape)
    const lines = [...new Set(prev.squares.map(([i, _]) => i))]
    const completeLines = lines.filter(i => nextStack[i].every(s => s != null))
    if (completeLines.length > 0) {
        const minCompleted = Math.min(...completeLines)
        const nbCompleted = completeLines.length
        nextStack = [
            ...INITIAL_GRID.slice(0, nbCompleted),
            ...nextStack.slice(0, minCompleted),
            ...nextStack.slice(minCompleted + nbCompleted)
        ]
    }
    stack$.next(nextStack)
})


// New tetromino
nullCurrent$.pipe(
    observeOn(asyncScheduler),
    withLatestFrom(stack$)
).subscribe(([current, stack]) => {
    const nextCurrent = Tetromino.init()
    if (!nextCurrent.collide(stack)) current$.next(nextCurrent)
})

// Gravity
current$.pipe(
    pairwise(),
    filter(([prev, _]) => prev == null),
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
    withLatestFrom(notNullCurrent$, stack$)
).subscribe(([ev, current, stack]) => {
    const key = ev.keyCode
    if (key == 32) {
        const next = current.harddrop(stack)
        if (next != null) current$.next(next)
        current$.next(null)
    } else if (key == 37) {
        const next = current.move(0, -1, stack)
        if (next != null) current$.next(next)
    } else if (key == 39) {
        const next = current.move(0, 1, stack)
        if (next != null) current$.next(next)
    } else if (key == 40) {
        const next = current.move(1, 0, stack)
        if (next != null) current$.next(next)
    } else if (key == 65) {
        const next = current.rotateLeft(stack)
        if (next != null) current$.next(next)
    } else if (key == 90) {
        const next = current.rotateRight(stack)
        if (next != null) current$.next(next)
    }
})
