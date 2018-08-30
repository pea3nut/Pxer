import React from 'react';
import ReactDOM from 'react-dom';
import PxerOutputApp from './components/App';

ReactDOM.render(<PxerOutputApp resultData={window.resultData}/>, document.getElementById("pxer-output"));
