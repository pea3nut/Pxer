'use strict';

class PxerEvent{
    private _pe_event: PxerEvent.PEEVTMap;
    private _pe_oneEvent: PxerEvent.PEEVTMap;
    constructor(private eventList: string[]=[]){
        this._pe_event ={};
        this._pe_oneEvent ={};
    };
    on(type: string, listener: PxerEvent.PEEVTListener){
        if(!this._pe_event[type]) this._pe_event[type]=[];
        this._pe_event[type].push(listener);
        return true;
    };
    one(type: string, listener: PxerEvent.PEEVTListener){
        if(!this._pe_oneEvent[type]) this._pe_oneEvent[type]=[];
        this._pe_oneEvent[type].push(listener);
        return true;
    };
    dispatch(type: string,...data : any[]){
        if(this.eventList.indexOf(type) ===-1) return false;
        if(this._pe_event[type]) this._pe_event[type].forEach(fn=>fn(...data));
        if(this._pe_oneEvent[type]){
            this._pe_oneEvent[type].forEach(fn=>fn(...data));
            delete this._pe_oneEvent[type];
        }
        if(this._pe_event[PxerEvent.WildCard.all]) this._pe_event[PxerEvent.WildCard.all].forEach(fn=>fn(...data));
        if(this._pe_oneEvent[PxerEvent.WildCard.all]){
            this._pe_oneEvent[PxerEvent.WildCard.all].forEach(fn=>fn(...data));
            delete this._pe_oneEvent[PxerEvent.WildCard.all];
        }
        return true;
    };
    off(eventType: string|PxerEvent.WildCard, listener: PxerEvent.PEEVTListener|PxerEvent.WildCard){

        if(eventType ===PxerEvent.WildCard.all){
            this._pe_event ={};
            this._pe_oneEvent ={};
            return true;
        };

        if(listener===PxerEvent.WildCard.all){
            delete this._pe_event[eventType];
            delete this._pe_oneEvent[eventType];
            return true;
        };

        let index1 = this._pe_event[eventType].lastIndexOf(<PxerEvent.PEEVTListener>listener);
        if (index1 !== -1) {
            this._pe_event[eventType].splice(index1, 1);
        };

        let index2 =this._pe_oneEvent[eventType].lastIndexOf(<PxerEvent.PEEVTListener>listener);
        if(index2 !== -1){
            this._pe_oneEvent[eventType].splice(index2 ,1);
        };

        return true;

    };
};

namespace PxerEvent {
    export type PEEVTListener = (...data: any[])=>void;
    export interface PEEVTMap {
        [evtname: string]: PEEVTListener[],
    }
    export enum WildCard {
        all = "*",
    }
}

export default PxerEvent