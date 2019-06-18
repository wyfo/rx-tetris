import React from 'react'
import Grid from './Grid';
import { current$, Tetromino } from './Tetromino';


const App = props => <Grid></Grid>

export default App;
current$.next(Tetromino.init())
