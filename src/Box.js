import React from 'react'
import { TETROMINO_BOX } from "./constants";
import Line from "./Line";

const Box = props => <table className="grid">
    <tbody>
        {TETROMINO_BOX[props.shape].map((line, i) =>
            <Line line={line} key={i}></Line>
        )}
    </tbody>
</table>

export default Box
