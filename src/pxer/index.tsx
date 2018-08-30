import React from 'react';
import ReactDOM from 'react-dom';
import PxerMainApp from './components/PxerMainApp';
import './style/style.scss';
import PxerApp from './pxerapp/PxerApp.3.class';

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
        var elt =document.createElement('div');
        var insetElt=(
            document.getElementById('wrapper')
            || ((document.getElementById('root') as HTMLElement).childNodes[1] as HTMLElement)
            || document.body
        );
        insetElt.insertBefore(elt,insetElt.firstChild);
    
        ReactDOM.render(<PxerMainApp />, elt);
    } else {
        console.log("Pxer is not supported on this page. Not loading.")
    }
});
