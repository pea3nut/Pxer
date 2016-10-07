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

XMLHttpRequest.prototype.refererSend =function(url){
    var originUrl =document.URL;
    history.replaceState({} ,null ,url);
    this.send();
    history.replaceState({} ,null ,originUrl);
};

