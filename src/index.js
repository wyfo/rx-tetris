import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { next$ } from './logic';
import { NEXT_QUEUE_SIZE } from './constants';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
for (let i = 0; i < NEXT_QUEUE_SIZE + 1; ++i) next$.next(null)
