function PxerThread(id){
    /*!当前线程的ID*/
    this.id=id;
    /**
     * 当前线程的状态
     * - free 空闲
     * - action 执行中
     * */
    this.state="free"//[free|action]
    /*!线程执行的任务*/
    this.task;
    /*!ajax超时重试时间*/
    this.timeout;
    /*!最多重试次数*/
    this.maxRetry;

    /*!线程已经重试的次数*/
    this._retry=0;
    /*!线程当前请求的URL*/
    this._url;
    /*!使用的xhr对象*/
    this._xhr;
};
PxerThread.prototype={
    /*!任务执行失败的回调函数*/
    "fail" :function(pt ,statusText){},
    /*!任务全部执行完毕的回调函数*/
    "end" :function(pt){},
    /*!每次ajax响应的回调函数*/
    "callback" :function(pt ,responseText){},

    /*!运行线程*/
    "run" :function(){},
    /*!终止线程*/
    "stop" :function(){},

    /*!发送ajax请求*/
    "_sendAjax" :function(){},
};
PxerThread.prototype["stop"] =function(){
    this.state ="free";
    this._xhr.abort();
};
PxerThread.prototype["run"] =function(){
    this._retry =0;

    //判断行为，读取要请求的URL
    if(this.task instanceof IllustRequest){
        if(this.task.hasNextUrl()){
            this._url =this.task.readUrl()
        }else{
            this.end(this);
            return;
        };
    }else if(this.task instanceof PageRequest){
        if(this._url !== this.task.url){
            this._url =this.task.url;
        }else{
            this.end(this);
            return;
        };
    }else{
        this.fail(this ,"task");
        return;
    };

    //发送ajax请求
    this._xhr =this._sendAjax();

};
PxerThread.prototype["_sendAjax"] =function(){
    this.state ='action';
    return $.ajax({
        "context"   :this,
        "dataType"  :'html',
        "timeout"   :this.timeout*1000,
        "url"       :this._url,
        "complete"   :function(){
        },
        "success"   :function(responseText){
            this.state ='free';
            this._retry =0;
            this.callback(this ,responseText);
            this.run();
        },
        "error"   :function(xhr ,statusText){
            this.state ='free';
            if(statusText ==="timeout"){
                if(++this._retry >this.maxRetry){
                    this.fail(this ,"timeout");
                }else{
                    this._xhr =this._sendAjax();
                };
            }else{
                this.fail(this ,statusText);
            };
        },
    });
};