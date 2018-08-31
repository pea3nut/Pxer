import React from 'react';
import ReactDOM from 'react-dom';
import PxerOutputApp from './components/App';
import {PxerSelectableWorks} from './lib'
import { PxerWorks } from '../pxer/pxerapp/PxerWorksDef.-1';

var elt = document.getElementById("pxer-output");
var works: PxerSelectableWorks[] = (window as any).resultData;

if (!works) {
    (elt as HTMLElement).innerHTML = "<b>未获取到作品数据</b>"
} else {
    
    for (var work of works) {
        work.checked = true;
    }
    
    ReactDOM.render(<PxerOutputApp resultData={works}/>, elt);    
}
