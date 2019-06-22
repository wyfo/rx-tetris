import { randomRange } from "./utils";

export function* randomGenerator() {
    do {
        const tetrominos = [...Array(7).keys()]
        for (let max = 6; max > 0; --max) {
            const index = randomRange(0, max)
            yield tetrominos.splice(index, 1)[0]
        }
        yield tetrominos[0]
    } while (true)
}
