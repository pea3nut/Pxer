Promise.prototype.finally = function (callback) {
    return this.then(
        value  => Promise.resolve(callback()).then(() => value),
        reason => Promise.resolve(callback()).then(() => { throw reason })
    );
};

window.afterLoad =function(fn){
    if(document.readyState !=='loading'){
        setTimeout(fn);
    }else{
        document.addEventListener('DOMContentLoaded' ,fn);
    };
};

Object.copy =function(target){
    var obj ={};
    for(let key in target){
        var opd = Object.getOwnPropertyDescriptor(target ,key);

        if (
            opd
            &&(
                !opd.writable
                || !opd.configurable
                || !opd.enumerable
                || opd.get
                || opd.set
            )
        ){
            Object.defineProperty(obj ,key ,opd);
        }else{
            obj[key] =target[key];
        };
    };
    return obj;
};




//包装Array
['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
    var original = Array.prototype[method];
    Array.prototype[method] =function() {
        var result = original.apply(this, arguments);
        if(typeof this['Hook:change'] ==='function') this['Hook:change']();
        return result;
    };
});

EventTarget.prototype.addOneEventListener =function(type,listener,useCapture){
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
        if(listener !=='*'){
            return originRemove.apply(this ,arguments);
        };
        let eltMap =map.get(this);
        if(eltMap[type] ===undefined) return;
        for(let {listener:l ,useCapture:u} of eltMap[type]){
            originRemove.bind(this)(type ,l ,u);
        };
    };
}(EventTarget.prototype.addEventListener ,EventTarget.prototype.removeEventListener);

XMLHttpRequest.prototype.refererSend =function(url){
    var originUrl =document.URL;
    history.replaceState({} ,null ,url);
    this.send();
    history.replaceState({} ,null ,originUrl);
};

window.setDefalut =function(obj ,key ,val){
    if(key in obj) return false;
    obj[key] =val;
    return true;
};

[DocumentFragment,HTMLDocument,Element].forEach(constructor=>{
    constructor.prototype.querySelectorList =function(...selector){
        var result;
        for(let i=0 ;i<selector.length ;i++){
            result =this.querySelector(selector[i]);
            if(result !==null) return result;
        };
    };
});

