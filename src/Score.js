import React from 'react'
import { bindWith } from 'rx-react-binding';
import { score$ } from './logic';

const Score = props => <div>{props.score}</div>

export default bindWith({ score$ })(Score)
