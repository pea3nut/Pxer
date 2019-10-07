class PxerThread extends PxerEvent{
    /**
     * @param id {string} 线程的ID，便于调试
     * @param {Object} config 线程的配置信息
     * */
    constructor({id ,config}={}){
        super(['load','error','fail']);
        /**当前线程的ID*/
        this.id =id;
        /**
         * 当前线程的状态
         * - free
         * - ready
         * - error
         * - fail
         * - running
         * */
        this.state='free';
        /**线程执行的任务*/
        this.task =null;

        /**
         *
         * */
        this.config =config ||{
            /**ajax超时重试时间*/
            timeout:8000,
            /**最多重试次数*/
            retry:5,
        };

        /**运行时参数*/
        this.runtime ={};

        /**使用的xhr对象*/
        this.xhr =null;

    };
};

/**
 * 对抓取到的URL和HTML进行校验
 * @param {string} url
 * @param {string} html
 * @return {string|true} 返回字符串表示失败
 * */
PxerThread.checkRequest =function(url ,html){
    if(!html) return 'empty';
    if(html.indexOf("_no-item _error") !==-1){
        if(html.indexOf("sprites-r-18g-badge") !==-1) return 'r-18g';
        if(html.indexOf("sprites-r-18-badge") !==-1) return 'r-18';
    };
    if(html.indexOf("sprites-mypixiv-badge") !==-1) return 'mypixiv';
    return true;
};

/**终止线程的执行*/
PxerThread.prototype['stop'] =function(){
    this.xhr.abort();
};

/**
 * 初始化线程
 * @param {PxerRequest} task
 * */
PxerThread.prototype['init'] =function(task){
    this.task=task;

    this.runtime ={};
    this.state ='ready';

    // 必要的检查
    if(Number.isNaN(+this.config.timeout)||Number.isNaN(+this.config.retry)){
        throw new Error(`PxerThread#init: ${this.id} config illegal`);
    }

    //判断行为，读取要请求的URL
    if(this.task instanceof PxerWorksRequest){
        this.runtime.urlList =this.task.url.slice();
    }else if(this.task instanceof PxerPageRequest){
        this.runtime.urlList =[this.task.url];
    }else{
        this.dispatch('error' ,`PxerThread#${this.id}.init: unknown task`);
        return false;
    };

};

/**
 * 使用PxerThread#xhr发送请求
 * @param {string} url
 * */
PxerThread.prototype['sendRequest'] =function(url){
    this.state ='running';
    this.xhr.open('GET' ,url ,true);
    // 单副漫画请求需要更改Referer头信息
    if(
        this.task instanceof PxerWorksRequest
        && this.task.type ==='manga'
        && this.task.isMultiple===false
        && /mode=big/.test(url)
    ){
        var referer =this.task.url.find(item=>item.indexOf('mode=medium')!==-1);
        var origin  =document.URL;
        if(!referer){
            this.dispatch('error','PxerThread.sendRequest: cannot find referer');
        };
        history.replaceState({} ,null ,referer);
        this.xhr.send();
        history.replaceState({} ,null ,origin);
    }else{
        this.xhr.send();
    };
};
/**运行线程*/
PxerThread.prototype['run'] =function _self(){
    const URL =this.runtime.urlList.shift();
    if(!URL){
        this.state ='free';
        this.task.completed =true;
        this.dispatch("load" ,this.task);
        return true;
    }

    const XHR =new XMLHttpRequest();

    this.xhr =XHR;
    XHR.timeout =this.config.timeout;
    XHR.responseType ='text';


    var retry=0;
    XHR.addEventListener('timeout',()=>{
        if(++retry > this.config.retry){
            this.state ='fail';
            this.dispatch('fail' ,new PxerFailInfo({
                task :this.task,
                url  :URL,
                type :'timeout',
                xhr  :XHR,
            }));
            return false;
        }else{
            this.sendRequest(URL);
        }
    });
    XHR.addEventListener("load" ,()=>{
        if(XHR.status.toString()[0]!=='2' &&XHR.status!==304){
            this.state ='fail';
            this.dispatch('fail' ,new PxerFailInfo({
                task :this.task,
                url  :URL,
                type :'http:'+XHR.status,
            }));
            return false;
        };
        // 判断是否真的请求成功
        var msg =PxerThread.checkRequest(URL ,XHR.responseText);
        if(msg !==true){
            this.state ='fail';
            this.dispatch('fail' ,{
                task :this.task,
                url  :URL,
                type :msg,
            });
            return false;
        };

        // 执行成功回调
        if(this.task instanceof PxerWorksRequest){
            this.task.html[URL] =XHR.responseText;
        }else{
            this.task.html =XHR.responseText;
        };
        _self.call(this);//递归
        return true;
    });
    XHR.addEventListener("error" ,()=>{
        this.state ='error';
        this.dispatch('error' ,{
            task :this.task,
            url  :URL,
        });
    });

    this.sendRequest(URL);

};

