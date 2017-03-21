'use strict';

class PxerEvent{
    constructor(eventList=[] ,shortName =true){
        this._pe_eventList =eventList;

        this._pe_event ={};
        this._pe_oneEvent ={};


        if(!shortName||typeof Proxy==='undefined') return this
        else return new Proxy(this ,{
            get(target ,property){
                if(property in target){
                    return target[property];
                }else if(target._pe_eventList.indexOf(property) !==-1){
                    return target.dispatch.bind(target ,property);
                }else{
                    return target[property];
                };
            },
        });

    };
    on(type, listener){
        if(!PxerEvent.check(this ,type ,listener))return false;
        if(!this._pe_event[type]) this._pe_event[type]=[];
        this._pe_event[type].push(listener);
        return true;
    };
    one(type, listener){
        if(!PxerEvent.check(this ,type ,listener))return false;
        if(!this._pe_oneEvent[type]) this._pe_oneEvent[type]=[];
        this._pe_oneEvent[type].push(listener);
        return true;
    };
    dispatch(type ,...data){
        if(this._pe_eventList.indexOf(type) ===-1) return false;
        if(this._pe_event[type]) this._pe_event[type].forEach(fn=>fn(...data));
        if(this._pe_oneEvent[type]){
            this._pe_oneEvent[type].forEach(fn=>fn(...data));
            delete this._pe_oneEvent[type];
        }
        if(this._pe_event['*']) this._pe_event['*'].forEach(fn=>fn(...data));
        if(this._pe_oneEvent['*']){
            this._pe_oneEvent['*'].forEach(fn=>fn(...data));
            delete this._pe_oneEvent['*'];
        }
        return true;
    };
    off(eventType, listener){
        if(!PxerEvent.checkEvent(this ,eventType)) return false;
        if(listener &&!PxerEvent.checkListener(listener)) return false;

        if(eventType ===true){
            this._pe_event ={};
            this._pe_oneEvent ={};
            return true;
        };

        if(listener===true || listener==='*'){
            delete this._pe_event[eventType];
            delete this._pe_oneEvent[eventType];
            return true;
        };

        let index1 = this._pe_event[type].lastIndexOf(listener);
        if (index1 !== -1) {
            this._pe_event[type].splice(index1, 1);
        };

        let index2 =this._pe_oneEvent[type].lastIndexOf(listener);
        if(index2 !== -1){
            this._pe_oneEvent[type].splice(index2 ,1);
        };

        return true;

    };
};

PxerEvent.check =function(pe ,eventType ,listener){
    return PxerEvent.checkEvent(pe ,eventType)&&PxerEvent.checkListener(listener);
};
PxerEvent.checkEvent =function(pe ,eventType){
    if(eventType !=='*' &&pe._pe_eventList.indexOf(eventType) ===-1){
        console.warn(`PxerEvent : "${eventType}" is not in eventList[${pe._pe_eventList}]`);
        return false;
    };
    return true;
};
PxerEvent.checkListener =function(listener){
    if(!(listener instanceof Function || listener===true || listener==='*')){
        console.warn(`PxerEvent: "${listener}" is not a function`);
        return false;
    };
    return true;
};


