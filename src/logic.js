import { withLatestFrom, pairwise, observeOn, filter, switchMap, map, bufferCount, shareReplay, startWith, mapTo, switchAll } from 'rxjs/operators'
import { Subject, interval, asyncScheduler, fromEvent, BehaviorSubject, combineLatest, merge, empty, timer, concat, of } from 'rxjs';
import { INITIAL_GRID, GHOST, GRAVITY_TIME, NEXT_QUEUE_SIZE, HOLD, DROP, ROTATE_LEFT, ROTATE_RIGHT, LEFT, RIGHT, DOWN, ARR, DAS } from './constants';
import Tetromino from './Tetromino';
import { applyToMatrix } from './utils';

export const next$ = new Subject()
export const queue$ = next$.pipe(bufferCount(NEXT_QUEUE_SIZE, 1))
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
    shareReplay(1),
    startWith(INITIAL_GRID)
)
export const hold$ = new BehaviorSubject(null)
const alreadySwapped$ = merge(
    hold$.pipe(mapTo(true)),
    nullCurrent$.pipe(mapTo(false))
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

const getNewTetromino = (stack, queue) => {
    const nextCurrent = Tetromino.init(queue[0])
    queue$.next(Tetromino.newShape())
    if (!nextCurrent.collide(stack)) current$.next(nextCurrent)
}

// New tetromino
nullCurrent$.pipe(
    observeOn(asyncScheduler),
    withLatestFrom(stack$, queue$)
).subscribe(([_, stack, queue]) => {
    getNewTetromino(stack, queue)
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
const keydown$ = fromEvent(document, 'keydown').pipe(
    filter(ev => !ev.repeat),
    map(ev => ev.key)
)
const keyup$ = fromEvent(document, 'keyup').pipe(
    map(ev => ev.key)
)
const repeat = key => merge(
    keydown$.pipe(
        filter(k => k == key),
        map(() => concat(of(null), timer(DAS, ARR)))
    ),
    keyup$.pipe(
        filter(k => k == key),
        mapTo(empty())
    )
).pipe(
    switchAll(),
    withLatestFrom(current$, stack$),
    filter(([_, current, stack]) => current != null)
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
    if (next != null) current$.next(next)
})
keydown$.pipe(
    filter(key => key == ROTATE_LEFT),
    withLatestFrom(current$, stack$),
    filter(([_, current, stack]) => current != null)
).subscribe(([_, current, stack]) => {
    const next = current.rotateLeft(stack)
    if (next != null) current$.next(next)
})
keydown$.pipe(
    filter(key => key == ROTATE_RIGHT),
    withLatestFrom(current$, stack$),
    filter(([_, current, stack]) => current != null)
).subscribe(([_, current, stack]) => {
    const next = current.rotateRight(stack)
    if (next != null) current$.next(next)
})
keydown$.pipe(
    filter(key => key == DROP),
    withLatestFrom(current$, stack$),
    filter(([_, current, stack]) => current != null)
).subscribe(([_, current, stack]) => {
    const next = current.harddrop(stack)
    if (next != null) current$.next(next)
    current$.next(null)
})
keydown$.pipe(
    filter(key => key == HOLD),
    withLatestFrom(alreadySwapped$, hold$, queue$, current$, stack$),
    filter(([_, alreadySwapped, hold, queue, current, stack]) => !alreadySwapped && current != null)
).subscribe(([_, alreadySwapped, hold, queue, current, stack]) => {
    if (hold == null) getNewTetromino(stack, queue)
    else current$.next(Tetromino.init(hold))
    hold$.next(current.shape)
})
