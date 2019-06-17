import React from 'react'
import { BehaviorSubject } from 'rxjs';
import Line from './Line';
import { bindWith } from 'rx-react-binding';

export const GRID_HEIGHT = 22
export const GRID_WIDTH = 10
export const INITIAL_GRID = Array(GRID_HEIGHT).fill(null).map(() =>
    Array(GRID_WIDTH).fill(null)
)

export const grid$ = new BehaviorSubject(INITIAL_GRID)

const Grid = props => <table className="grid">
    <tbody>
        {props.grid.map((line, i) =>
            <Line line={line} key={i}></Line>
        )}
    </tbody>
</table>

export default bindWith({ grid$ })(Grid)
