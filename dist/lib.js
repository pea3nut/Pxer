'use strict';

// 全局函数
window.afterLoad =function(fn){
    if(document.readyState !=='loading'){
        setTimeout(fn);
    }else{
        document.addEventListener('DOMContentLoaded' ,fn);
    };
};
window.setDefalut =function(obj ,key ,val){
    if(key in obj) return false;
    obj[key] =val;
    return true;
};
window.blinkTitle =function(addMsg ,spaceMsg){
    var addMsg =addMsg ||'[完成] ';
    var spaceMsg =spaceMsg ||'[　　] ';
    var timer =setInterval(()=>{
        if(this.title.indexOf(addMsg) !==-1){
            this.title =this.title.replace(addMsg ,spaceMsg);
        }else if(this.title.indexOf(spaceMsg) !==-1){
            this.title =this.title.replace(spaceMsg ,addMsg);
        }else{
            this.title =addMsg+this.title;
        };
    },300);
    this.addOneEventListener('mousemove' ,()=>{
        clearInterval(timer);
        this.title =this.title.replace(spaceMsg ,"").replace(addMsg ,"");
    });
};
window.parseURL =function(url=document.URL){
    var arr  =url.match(/^(?:(https?)\:)?\/\/([\w\_\.]+)((?:\/[^\/?]*)*)\/?(?:\?(.+))?$/);
    var data ={
        protocol:arr[1],
        domain:arr[2],
        path:arr[3],
        query:arr[4],
    };
    if(data.query && data.query.indexOf('=')!==-1){
        data.query ={};
        for(let item of arr[4].split('&')){
            let tmp =item.split('=');
            data.query[tmp[0]]=tmp[1];
        };
    }
    return data;
};
window.createScript =function(url){
    var elt =document.createElement('script');
    elt.charset='utf-8';
    return function(resolve,reject){
        elt.addEventListener('load',resolve);
        elt.addEventListener('load',function(){
            if(window['PXER_MODE']==='dev') console.log('Loaded '+url);
        });
        elt.addEventListener('error',reject);
        elt.src =url;
        document.documentElement.appendChild(elt);
        return elt;
    };
};
window.execPromise =function(taskList,call){
    var promise =Promise.resolve();
    if(Array.isArray(taskList)&&Array.isArray(taskList[0])){
        for(let array of taskList){
            promise =promise.then(()=>Promise.all(array.map(item=>new Promise(call(item)))));
        }
    }else if(Array.isArray(taskList)){
        promise =promise.then(()=>Promise.all(array.map(item=>new Promise(call(item)))));
    }else{
        promise =promise.then(call(item));
    };
    return promise;
}
/*EventTarget扩展
EventTarget.prototype['addOneEventListener'] =function(type,listener,useCapture){
    var fn;
    this.addEventListener(type,listener,useCapture);
    this.addEventListener(type,fn=()=>{
        this.removeEventListener(type,listener,useCapture);
        this.removeEventListener(type,fn,useCapture);
        fn=null;
    },useCapture);
};
~function(originAdd ,originRemove){
    var map =new Map();
    EventTarget.prototype.addEventListener =function(type,listener,useCapture){
        let eltMap =map.get(this);
        if(eltMap ===undefined) map.set(this ,eltMap={});
        if(eltMap[type] ===undefined) eltMap[type] =[];
        eltMap[type].push({listener ,useCapture});
        return originAdd.apply(this ,arguments);
    };
    EventTarget.prototype.removeEventListener =function(type,listener,useCapture){
        if(listener!=='*' && type!=='*'){
            return originRemove.apply(this ,arguments);
        };
        let eltMap =map.get(this);
        if(type==='*'){
            for(let hasType in eltMap){
                this.removeEventListener(hasType,'*',useCapture);
            };
            return;
        };
        if(eltMap[type] ===undefined) return;
        for(let {listener:l ,useCapture:u} of eltMap[type]){
            originRemove.bind(this)(type ,l ,u);
        };
    };
}(EventTarget.prototype.addEventListener ,EventTarget.prototype.removeEventListener);
*/
