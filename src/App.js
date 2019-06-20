import React from 'react'
import Grid from './Grid';
import Queue from './Queue';


const App = props => <div style={{ 'flex-direction': 'row', display: 'flex' }}>
  <Grid></Grid>
  <Queue></Queue>
</div>

export default App;
