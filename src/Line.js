import React from 'react'
import Square from "./Square";

const Line = props => <tr>
    {props.line.map((square, i) =>
        <Square square={square} key={i}></Square>
    )}
</tr>

export default Line
