import React from 'react';
import ReactDOM from 'react-dom';
import PxerOutputApp from './components/App';
import {PxerWorks} from '../pxer/pxerapp/PxerWorksDef.-1'

ReactDOM.render(<PxerOutputApp resultData={(window as any).resultData as PxerWorks[]}/>, document.getElementById("pxer-output"));
