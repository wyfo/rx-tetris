import React from 'react'
import Line from './Line';
import { bindWith } from 'rx-react-binding';
import { grid$ } from './logic';


const Grid = props => props.grid ? <table className="grid">
    <tbody>
        {props.grid.map((line, i) =>
            <Line line={line} key={i}></Line>
        )}
    </tbody>
</table> : <></>

export default bindWith({ grid$ })(Grid)
