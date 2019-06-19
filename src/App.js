import React from 'react'
import Grid, { grid$ } from './Grid';
import { current$ } from './Tetromino';
import { delay, take, filter, withLatestFrom } from 'rxjs/operators';
import { GRAVITY_TIME } from './gravity';
import { interval } from 'rxjs';


const App = props => <Grid></Grid>

export default App;
// current$.pipe(delay(1000), filter(t => t != null), take(20)).subscribe(t => {
//   current$.next(t.move(1, 0, grid$.value))
// })
current$.next(null)
