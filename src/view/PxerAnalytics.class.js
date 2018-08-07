'use strict';

/**
 * Pxer统计类
 * @class
 * */
class PxerAnalytics{
    constructor(){
        this.uid = window.localStorage.getItem("PXER_UID");
        if (!this.uid) {
            this.uid = Math.random().toString(36).replace(/[^a-z]+/g, '') 
                      +Math.random().toString(36).replace(/[^a-z]+/g, '');
            window.localStorage.setItem("PXER_UID", this.uid);
        }
        this.enabled = window['PXER_LOAD_ANALYTICS'] && (!window.localStorage.getItem("PXER_OPT_OUT_ANALYTICS"));
    };
    /**
     * 
     * @param {String} event - 发送的事件名称
     * @param {Object} data - 发送的数据（uid|pxer_mode|referer自动添加）
     */
    postData(event, data){
        if (!this.enabled) return;
        data.uid = this.uid;
        data.pxer_mode = window['PXER_MODE'];
        data.pxer_version = window['PXER_VERSION'];
        
        var xhr = new XMLHttpRequest();
        xhr.open("POST", window['PXER_URL']+"stats/"+event.replace(/\./g, "/"), true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onerror = (e) => console.error(`PxerAnalytics.postData: ${e.error}`);
        xhr.send(JSON.stringify(data));
    }

};