import React from 'react';
import ReactDOM from 'react-dom';
import PxerOutputApp from './components/App';
import {PxerSelectableWorks} from './lib'
import { PxerWorks } from '../pxer/pxerapp/PxerWorksDef.-1';

// @ts-ignore TS is so noisy:(
import { I18nextProvider } from 'react-i18next';
import i18n from './i18next'

var elt = document.getElementById("pxer-output");
var works: PxerSelectableWorks[] = (window as any).resultData;

if (!works) {
    (elt as HTMLElement).innerHTML = "<b>未获取到作品数据</b>"
} else {
    var lng = (window as any).defaultLng||navigator.language;
    for (var work of works) {
        work.checked = true;
    }
    
    ReactDOM.render(
    <I18nextProvider i18n={i18n} initialLanguage={lng as string}>
        <PxerOutputApp resultData={works}/>
    </I18nextProvider>, 
    elt);    
}
