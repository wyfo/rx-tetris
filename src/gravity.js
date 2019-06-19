import { interval } from "rxjs";
import { withLatestFrom } from "rxjs/operators";
import { current$ } from "./Tetromino";
import { grid$ } from "./Grid";

export const GRAVITY_TIME = 200
