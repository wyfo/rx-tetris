import React from 'react'
import Grid from './Grid';
import Queue from './Queue';
import { bindWith } from 'rx-react-binding';
import { hold$ } from './logic';
import Box from './Box';


const Hold = bindWith({ shape$: hold$ })(Box)

const App = props => <div style={{ 'flex-direction': 'row', display: 'flex' }}>
  <Hold></Hold>
  <Grid></Grid>
  <Queue></Queue>
</div>

export default App;
