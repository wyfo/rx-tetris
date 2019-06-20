import React from 'react'
import { bindWith } from "rx-react-binding";
import { queue$ } from "./logic";
import Box from './Box';

const Queue = props => props.queue ? <div>
    {props.queue.map((shape, i) =>
        <Box shape={shape} key={i}></Box>
    )}
</div> : <></>

export default bindWith({ queue$ })(Queue)
