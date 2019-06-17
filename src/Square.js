import React from 'react'

const squareToClass = square => square || "empty"

const Square = props => <td className={squareToClass(props.square)}></td>

export default Square
