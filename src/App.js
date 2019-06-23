import React from 'react'
import Grid from './Grid';
import Queue from './Queue';
import { bindWith } from 'rx-react-binding';
import { hold$ } from './logic';
import Box from './Box';
import Score from './Score';


const Hold = bindWith({ shape$: hold$ })(Box)

const App = props => <div style={{ flexDirection: 'row', display: 'flex' }}>
  <Hold></Hold>
  <Grid></Grid>
  <Queue></Queue>
  <Score></Score>
</div>

export default App;
