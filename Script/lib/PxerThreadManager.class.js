function PxerThreadManager(config ,taskList){
    /*!配置参数*/
    this.config =config;
    /*!任务执行完毕后的回调函数*/
    this.callback;
    /*!要执行的任务队列*/
    this.taskList =taskList;
    /*!获取到的结果集*/
    this.resultSet =new Array();

    /*!半成品结果集*/
    this._semiResult =new Object();
    /*!所有线程对象*/
    this._allPxerThread =new Array();

    this._constructor();
};
PxerThreadManager.prototype={
    /*!开始执行队列任务*/
    "execute":function(){},
    /*!停止执行队列任务*/
    "stop" :function(pt ,data){},

    /*!构造函数*/
    "_constructor":function(){},

    /*!用于赋值PxerThread的回调函数*/
    "singleEnd" :function(pt){},
    "threadCallback" :function(pt ,responseText){},
    "threadFail" :function(pt ,statusText){},
};


PxerThreadManager.prototype["execute"] =function(){
    if(this.taskList.length ===0) this.callback();

    for(var i=0,task ;(i<this._allPxerThread.length)&&(task=this.taskList.shift()) ;i++){
        if(task instanceof PxerRequest){
            console.log(i+" is running...");
            console.log(task);
            this._allPxerThread[i].task =task;
            this._allPxerThread[i].run();
        }else{
            this.threadFail("task is not PxerRequest" ,task);
        };
    };
};
PxerThreadManager.prototype["stop"] =function(){
    for(var key in this._allPxerThread){
        this._allPxerThread[key].stop();
    };
};

PxerThreadManager.prototype["_constructor"] =function(){
    var ptm_this =this;
    for(var i=0 ;i<this.config.thread ;i++){
        this._allPxerThread[i] =new PxerThread(i);
        this._allPxerThread[i].maxRetry =this.config.maxRetry;
        this._allPxerThread[i].timeout =this.config.timeout;
        this._allPxerThread[i].end =function(){
            ptm_this.threadEnd.apply(ptm_this ,arguments);
        };
        this._allPxerThread[i].callback =function(){
            ptm_this.threadCallback.apply(ptm_this ,arguments);
        };
        this._allPxerThread[i].fail =function(){
            ptm_this.threadFail.apply(ptm_this ,arguments);
        };
    };
};

PxerThreadManager.prototype["threadEnd"] =function(pt){
    //获取结果
    this.resultSet =this.resultSet.concat( this._semiResult[pt.id] );
    delete this._semiResult[pt.id];

    //判断执行下一个任务
    if(this.taskList.length ===0){
        var isOver =true;
        for(var i=0 ;i<this._allPxerThread.length ;i++){
            if(this._allPxerThread[i].state ==='action'){
                isOver =false;
                break;
            };
        };
        if(isOver) this.callback();
    }else{
        pt.task =this.taskList.shift();
        pt.run();
    };

};
PxerThreadManager.prototype["threadCallback"] =function(pt ,responseText){
    var php =new PxerHtmlParser(this.config ,pt.task ,responseText);
    var result =php.parse();
    if(this._semiResult[pt.id]){
        $.extend(this._semiResult[pt.id] ,result);
    }else{
        this._semiResult[pt.id] =result;
    };
};
PxerThreadManager.prototype["threadFail"] =function(pt ,statusText){
    if(statusText !=="abort"){
        console.error(statusText);
        console.error(pt);
    };
};

