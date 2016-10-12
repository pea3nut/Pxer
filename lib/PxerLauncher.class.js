'use strict';

class PxerLauncher{
    constructor(options){
        Object.assign(this ,{
            sync:[],
            asyn:[],
            onsync:()=>console.log('Sync list is OK!'),
            onasyn:()=>{},
            onerror:err=>console.error(err),
            cache:true,
        } ,options)
    };
};


PxerLauncher.prototype['load'] =function(){
    this.loadSync();
    this.loadAsyn();
};


PxerLauncher.prototype['createElt'] =function(path){
    var extName =path.replace('.php','').match(/\.([A-Za-z0-9]*?)(?:\?.+)?$/)[1];
    let tagName =this.tagMap[extName].tag;
    var elt =document.createElement(tagName);

    //避免缓存(new Date()).getTime()
    if(!this.cache) path =path.indexOf('?')==-1 ?path+'?'+(new Date()).getTime() :path+'&'+(new Date()).getTime();

    let attr =this.tagMap[extName].attr;
    for(let key in attr){
        if(attr[key] ==='%PATH%'){
            elt.setAttribute(key ,path);
            continue;
        };
        elt.setAttribute(key ,attr[key])
    };

    return elt;

};


PxerLauncher.prototype['loadAsyn'] =function(){
    this.asyn.forEach(function (item){
        let elt =this.createElt(item);
        elt.async =true;
        document.head.appendChild(elt);
    } ,this);
};
PxerLauncher.prototype['loadSync'] =function(){
    var pms =Promise.resolve();
    this.sync.forEach(function (item){
        pms =pms.then(()=>{
            return new Promise((resolve ,reject)=>{
                let elt =this.createElt(item);
                elt.addEventListener('load' ,resolve);
                elt.addEventListener('error' ,reject.bind(null ,elt));
                document.head.appendChild(elt);
            });
        });
    } ,this);

    pms.then(this.onsync);
    pms.catch((err)=>{
        console.error('PxerLauncher load file error!');
        this.onerror(err);
    });

};


PxerLauncher.prototype['tagMap'] ={
    js:{
        tag:'script',
        attr:{
            charset:'utf-8',
            type:'text/javascript',
            src:'%PATH%',
        }
    },
    css:{
        tag:'link',
        attr:{
            rel:'stylesheet',
            href:'%PATH%',
        }
    },
    ico:{
        tag:'link',
        attr:{
            rel:'shortcut icon',
            type:'image/x-icon',
            href:'%PATH%',
        }
    },
};





