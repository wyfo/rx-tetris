import { withLatestFrom, pairwise, filter, switchMap, map, bufferCount, shareReplay, startWith, mapTo, switchAll, share } from 'rxjs/operators'
import { Subject, interval, fromEvent, BehaviorSubject, combineLatest, merge, empty, timer, concat, of } from 'rxjs';
import { INITIAL_GRID, GHOST, GRAVITY_TIME, NEXT_QUEUE_SIZE, HOLD, DROP, ROTATE_LEFT, ROTATE_RIGHT, LEFT, RIGHT, DOWN, ARR, DAS, TETROMINO_SHAPE } from './constants';
import Tetromino from './Tetromino';
import { applyToMatrix } from './utils';
import { randomGenerator } from './random';

const randGen = randomGenerator()
export const next$ = new Subject()
export const queue$ = next$.pipe(
    map(a => TETROMINO_SHAPE[randGen.next().value]),
    bufferCount(NEXT_QUEUE_SIZE, 1),
    share()
)
const current$ = new Subject()
const stack$ = new BehaviorSubject(INITIAL_GRID)
export const grid$ = combineLatest(stack$, current$).pipe(
    map(([stack, current]) => {
        const grid = JSON.parse(JSON.stringify(stack))
        applyToMatrix(grid, current.ghost(stack), GHOST)
        applyToMatrix(grid, current.squares, current.shape)
        return grid
    }),
    shareReplay(1),
    startWith(INITIAL_GRID)
)
export const hold$ = new BehaviorSubject(null)
const alreadySwapped$ = merge(
    hold$.pipe(mapTo(true)),
    next$.pipe(mapTo(false))
)
const lock$ = new Subject()
const resetGravity$ = new Subject()

export const score$ = new BehaviorSubject(0)
const mark$ = new Subject()
mark$.pipe(
    withLatestFrom(score$),
    map(([pts, score]) => score + pts)
).subscribe(score => score$.next(score)) // Don't use method reference cause JS

const lines$ = new Subject()
lines$.pipe(
    filter(n => n > 0),
    pairwise(),
    map(([prev, n]) => {
        if (n === 1) return 100
        if (n === 2) return 300
        if (n === 3) return 500
        if (n === 4) return (prev === 4) ? 1200 : 800
    }),
).subscribe(pts => mark$.next(pts))

const pushNewTetromino = (shape, stack) => {
    const next = Tetromino.init(shape, stack)
    if (next == null) {
        next$.complete()
        current$.complete()
    } else {
        current$.next(next)
    }
}

queue$.pipe(
    pairwise(),
    withLatestFrom(stack$)
).subscribe(([[prev, _], stack]) => {
    pushNewTetromino(prev[0], stack)
})

// Lock
lock$.pipe(
    withLatestFrom(current$, stack$)
).subscribe(([_, current, stack]) => {
    let nextStack = JSON.parse(JSON.stringify(stack))
    applyToMatrix(nextStack, current.squares, current.shape)
    const lines = [...new Set(current.squares.map(([i, _]) => i))]
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
    next$.next()
    lines$.next(completeLines.length)
})

// Gravity
merge(next$, resetGravity$).pipe(
    switchMap(() => interval(GRAVITY_TIME)),
    withLatestFrom(current$, stack$),
).subscribe(([_, current, stack]) => {
    const next = current.move(1, 0, stack)
    if (next != null) current$.next(next)
    else lock$.next()
})

// Keys
const keydown$ = fromEvent(document, 'keydown').pipe(
    filter(ev => !ev.repeat),
    map(ev => ev.key)
)
const keyup$ = fromEvent(document, 'keyup').pipe(
    map(ev => ev.key)
)
const repeat = key => merge(
    keydown$.pipe(
        filter(k => k === key),
        map(() => concat(of(null), timer(DAS, ARR)))
    ),
    keyup$.pipe(
        filter(k => k === key),
        mapTo(empty())
    )
).pipe(
    switchAll(),
    withLatestFrom(current$, stack$),
)
repeat(LEFT).subscribe(([_, current, stack]) => {
    const next = current.move(0, -1, stack)
    if (next != null) current$.next(next)
})
repeat(RIGHT).subscribe(([_, current, stack]) => {
    const next = current.move(0, 1, stack)
    if (next != null) current$.next(next)
})
repeat(DOWN).subscribe(([_, current, stack]) => {
    const next = current.move(1, 0, stack)
    if (next != null) {
        resetGravity$.next()
        current$.next(next)
        mark$.next(1)
    }
})
keydown$.pipe(
    map(key => ({ [ROTATE_LEFT]: -1, [ROTATE_RIGHT]: 1 })[key]),
    filter(sign => sign != null),
    withLatestFrom(current$, stack$),
).subscribe(([sign, current, stack]) => {
    const next = current.rotate(sign, stack)
    if (next.heightToStack(stack) === 0) resetGravity$.next()
    if (next != null) current$.next(next)
})
keydown$.pipe(
    filter(key => key === DROP),
    withLatestFrom(current$, stack$),
).subscribe(([_, current, stack]) => {
    const height = current.heightToStack(stack)
    const next = current.move(height, 0, stack)
    if (next != null) current$.next(next)
    lock$.next()
    mark$.next(2 * height)
})
keydown$.pipe(
    filter(key => key === HOLD),
    withLatestFrom(alreadySwapped$),
    filter(([_, alreadySwapped]) => !alreadySwapped),
    withLatestFrom(hold$, current$, stack$),
).subscribe(([_, hold, current, stack]) => {
    if (hold == null) next$.next()
    else pushNewTetromino(hold, stack)
    hold$.next(current.shape)
})
