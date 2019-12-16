import { BehaviorSubject, combineLatest, concat, empty, fromEvent, interval, merge, of, Subject, timer } from 'rxjs';
import { bufferCount, filter, map, mapTo, pairwise, scan, share, shareReplay, startWith, switchAll, switchMap, withLatestFrom } from 'rxjs/operators';
import { ARR, DAS, DOWN, DROP, GHOST, GRAVITY_TIME, GRID_HEIGHT, HOLD, INITIAL_GRID, LEFT, NEXT_QUEUE_SIZE, RIGHT, ROTATE_LEFT, ROTATE_RIGHT, TETROMINO_SHAPE } from './constants';
import { randomGenerator } from './random';
import Tetromino from './Tetromino';
import { applyToMatrix } from './utils';

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

// Scoring
export const score$ = new BehaviorSubject(0)
export const b2b$ = new BehaviorSubject(false)
const mark$ = new Subject()
mark$.pipe(
    withLatestFrom(score$),
).subscribe(([pts, score]) => score$.next(score + pts))

const lines$ = new Subject()
lines$.pipe(
    withLatestFrom(b2b$),
    map(([{ number, tspin }, b2b]) => {
        let pts = 0
        if (tspin) {
            pts = {
                0: b2b ? 100 : 150,
                1: b2b ? 1200 : 800,
                2: b2b ? 1800 : 1200,
                3: b2b ? 1600 : 2400,
            }[number]
        } else {
            pts = {
                0: 100,
                1: 100,
                2: 300,
                3: 500,
                4: b2b ? 1200 : 800
            }[number]
        }
        return { pts, b2b: tspin || number === 4 }
    }),
).subscribe(({ pts, b2b }) => {
    b2b$.next(b2b)
    mark$.next(pts)
}) // Don't use method ref because JS 'this'
lines$.pipe(
    map(({ number }) => number),
    scan((combo, n) => (n > 0) ? combo + 1 : 0, 0),
    filter(combo => combo > 0)
).subscribe(combo => mark$.next(50 * (combo - 1)))

const pushNewTetromino = (shape, stack) => {
    const next = Tetromino.init(shape, stack)
    if (next == null) {
        next$.complete()
        current$.complete()
        mark$.complete()
        stack$.complete()
        hold$.complete()
        lock$.complete()
        resetGravity$.complete()
        lines$.complete()
        score$.complete()
        b2b$.complete()
        move$.complete()
        down$.complete()
        rotate$.complete()
        holdKey$.complete()
        drop$.complete()
        keydown$$.unsubscribe()
        keyup$$.unsubscribe()
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
        nextStack = [
            ...INITIAL_GRID.slice(0, completeLines.length),
            ...nextStack.filter((_, i) => !completeLines.includes(i))
        ]
    }
    stack$.next(nextStack)
    next$.next()
    let tspin = false
    if (current.shape === "T" && current.center[0] < (GRID_HEIGHT - 1)) {
        const corners = [[-1, -1], [-1, 1], [1, 1], [1, -1]].map(([i, j]) =>
            [i + current.center[0], j + current.center[1]]
        ).filter(([i, j]) => stack[i][j] != null)
        tspin = corners >= 3

    }
    lines$.next({ number: completeLines.length, tspin })
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
const move$ = new Subject()
move$.pipe(
    switchAll(),
    withLatestFrom(current$, stack$)
).subscribe(([move, current, stack]) => {
    const next = current.move(0, move, stack)
    if (next != null) current$.next(next)
})
const down$ = new Subject()
down$.pipe(
    switchAll(),
    withLatestFrom(current$, stack$)
).subscribe(([_, current, stack]) => {
    const next = current.move(1, 0, stack)
    if (next != null) {
        resetGravity$.next()
        current$.next(next)
        mark$.next(1)
    }
})
const rotate$ = new Subject()
rotate$.pipe(
    withLatestFrom(current$, stack$)
).subscribe(([sign, current, stack]) => {
    const next = current.rotate(sign, stack)
    if (next != null) {
        if (next.heightToStack(stack) === 0) resetGravity$.next()
        current$.next(next)
    }
})
const drop$ = new Subject()
drop$.pipe(
    withLatestFrom(current$, stack$),
).subscribe(([_, current, stack]) => {
    const height = current.heightToStack(stack)
    const next = current.move(height, 0, stack)
    if (next != null) current$.next(next)
    lock$.next()
    mark$.next(2 * height)
})
const holdKey$ = new Subject()
holdKey$.pipe(
    withLatestFrom(alreadySwapped$),
    filter(([_, alreadySwapped]) => !alreadySwapped),
    withLatestFrom(hold$, current$, stack$),
).subscribe(([_, hold, current, stack]) => {
    if (hold == null) next$.next()
    else pushNewTetromino(hold, stack)
    hold$.next(current.shape)
})
const keydown$$ = fromEvent(document, 'keydown', { passive: true }).pipe(
    filter(ev => !ev.repeat),
    map(ev => ev.key),
).subscribe(key => {
    switch (key) {
        case LEFT:
            move$.next(concat(of(null), timer(DAS, ARR)).pipe(mapTo(-1)))
            break
        case RIGHT:
            move$.next(concat(of(null), timer(DAS, ARR)).pipe(mapTo(1)))
            break
        case DOWN:
            down$.next(concat(of(null), timer(DAS, ARR)))
            break
        case ROTATE_LEFT:
            rotate$.next(-1)
            break
        case ROTATE_RIGHT:
            rotate$.next(1)
            break
        case HOLD:
            holdKey$.next()
            break
        case DROP:
            drop$.next()
            break
        default:
            break
    }
})
const keyup$$ = fromEvent(document, 'keyup', { passive: true }).pipe(
    map(ev => ev.key),
).subscribe(key => {
    switch (key) {
        case LEFT: case RIGHT:
            move$.next(empty())
            break
        case DOWN:
            down$.next(empty())
            break
        default:
            break
    }
})
