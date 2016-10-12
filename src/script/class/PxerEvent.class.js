'use strict';

class PxerEvent{
    constructor(eventList=[]){
        this.eventList =eventList;

        this._event ={};

        this._oneEvent ={};

        return new Proxy(this ,{
            get(target ,property){
                if(property in target){
                    return target[property];
                };

                let inEvent =target.eventList.some( item => property &&(item===property) );
                if(inEvent){
                    return target.dispatch.bind(target ,property);
                };


            },
        })
    };
};


PxerEvent.prototype.on =function(type, listener){

    if( !( this._checkEventType(type) && this._checkListener(listener) )) return false;

    this._event[type] ||(this._event[type]=[]);

    this._event[type].push(listener);
    return true;

};
PxerEvent.prototype.one =function(type, listener){

    if( !( this._checkEventType(type) && this._checkListener(listener) )) return false;

    this._oneEvent[type] ||(this._oneEvent[type]=[]);

    this._oneEvent[type].push(listener);
    return true;

};
PxerEvent.prototype.off =function(type, listener){

    if( !(
        (type ==='*' ||this._checkEventType(type) )
        && (typeof listener ==='undefined' ||this._checkListener(listener) )
    )) return false;

    if(type ==='*'){
        this._event ={};
        this._oneEvent ={};
        return true;
    };

    if(typeof listener ==='undefined'){
        delete this._event[type];
        delete this._oneEvent[type];
        return true;
    };

    let index1 = this._event[type].lastIndexOf(listener);
    if (index1 !== -1) {
        this._event[type].splice(index1, 1);
    };

    let index2 =this._oneEvent[type].lastIndexOf(listener);
    if(index2 !== -1){
        this._oneEvent[type].splice(index2 ,1);
    };

    return true;

};
PxerEvent.prototype.dispatch =function(type ,data){

    if(!this._checkEventType(type))return false;

    if( Array.isArray(this._event[type]) &&this._event[type].length!==0){
        this._event[type].forEach(function(item){
            item.call(this ,data);
        } ,this)
    };

    if( Array.isArray(this._oneEvent[type]) &&this._oneEvent[type].length!==0){
        this._oneEvent[type].forEach(function(item){
            item.call(this ,data);
        } ,this);
        delete this._oneEvent[type];
    };

    return true;

};


PxerEvent.prototype._checkEventType =function(type){

    let inEvent =this.eventList.some( item => type &&(item===type) );
    if(!inEvent){
        console.warn(`PxerEvent: "${type}" is not in eventList[${this.eventList}]`);
        return false;
    };

    return true;

};
PxerEvent.prototype._checkListener =function(listener){

    if(typeof listener !=='function'){
        console.warn(`PxerEvent: "${listener}" is not a function`);
        return false;
    };

    return true;

};






//测试代码
/*
class A extends PxerEvent{
    constructor(){
        super(['say']);
        this.b=2;
    }
}

var a =new A();

a.on('say' ,function(data){
    console.log(data);//kkk
    console.log(this.b);//2
});
a.one('say' ,function(data){
    console.log('one:'+data);
});
let seyHello;
a.one('say' ,seyHello=function(){
    console.log('hello');
});
a.off('say' ,seyHello);
a.dispatch('say' ,'kkk');
a.say('kkk');

// 输出：*/
//     kkk
//     2
//     one:kkk
//     kkk
//     2










