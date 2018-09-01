import React from 'react';
import ReactDOM from 'react-dom';
import PxerMainApp from './components/PxerMainApp';
import './style/style.scss';
import PxerApp from './pxerapp/PxerApp.3.class';
import moment from 'moment'

// @ts-ignore TS is so noisy:(
import { I18nextProvider } from 'react-i18next';
import i18n from './i18next'

function afterLoad(fn: ()=>void){
    if(document.readyState !=='loading'){
        setTimeout(fn);
    }else{
        document.addEventListener('DOMContentLoaded' ,fn);
    };
};

afterLoad(()=>{
    if (document.getElementById("pxer-output")){
        console.log("output page. not loading.")
        return;
    }
    var pxer = new PxerApp();
    if (pxer.isSupported()) {
        var lng =document.querySelector("html")? (document.querySelector("html") as HTMLElement).getAttribute("lang"):navigator.language;
        var elt =document.createElement('div');
        var insetElt=(
            document.getElementById('wrapper')
            || ((document.getElementById('root') as HTMLElement).childNodes[1] as HTMLElement)
            || document.body
        );
        insetElt.insertBefore(elt,insetElt.firstChild);
    
        ReactDOM.render(
            <I18nextProvider i18n={i18n} initialLanguage={lng as string}>
                <PxerMainApp />
            </I18nextProvider>,
            elt);
    } else {
        console.log("Pxer is not supported on this page. Not loading.")
    }
});
