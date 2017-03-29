class PxerThreadManager extends PxerEvent{
    /**
     * @param {number} timeout - 超时时间
     * @param {number} retry   - 重试次数
     * @param {number} thread  - 线程数
     * */
    constructor({timeout=5000,retry=3,thread=8}={}){
        super(['load' ,'error' ,'fail' ,'warn']);

        this.config ={timeout,retry,thread};

        /**
         * 任务列表
         * @type {PxerRequest[]}
         * */
        this.taskList =[];
        /**执行的任务列表的指针，指派了下一条要执行的任务*/
        this.pointer =0;
        /**
         * 存放的线程对象
         * @type {PxerThread[]}
         * */
        this.threads =[];
        /**
         * 每当执行任务开始前调用的中间件
         * @type {Function[]} 返回true继续执行，false终止执行
         * */
        this.middleware =[function(task){
            return !!task;
        }];

        /**运行时用到的变量*/
        this.runtime ={};

    };
};

/**
 * 停止线程的执行，实际上假装任务都执行完了
 * 停止后还会触发load事件，需要一段时间
 * */
PxerThreadManager.prototype['stop'] =function(){
    this.pointer =this.taskList.length+1;
};

/**
 * 初始化线程管理器
 * @param {PxerRequest[]} taskList
 * */
PxerThreadManager.prototype['init'] =function(taskList){
    if(! this.taskList.every(request=>request instanceof PxerRequest)){
        this.dispatch('error' ,'PxerThreadManager.init: taskList is illegal');
        return false;
    }


    // 初始任务与结果
    this.taskList=taskList;
    this.runtime ={};
    this.pointer =0;

    // 建立线程对象
    this.threads =[];
    for(let i=0 ;i<this.config.thread ;i++){
        this.threads.push(new PxerThread({
            id:i,
            config:{
                timeout :this.config.timeout,
                retry :this.config.retry,
            },
        }));
    };

    return this;
};
/**
 * 运行线程管理器
 * */
PxerThreadManager.prototype['run'] =function(){
    if(this.taskList.length ===0){
        this.dispatch('warn','PxerApp#run: taskList.length is 0');
        this.dispatch('load',[]);
        return false;
    };



    for(let thread of this.threads){

        thread.on('load' ,data=>{
            next(this,thread);
        });
        thread.on('fail' ,(pfi)=>{
            this.dispatch('fail',pfi);
            next(this,thread);
        });
        thread.on('error' ,this.dispatch.bind(this ,'error'));


        next(this,thread);

    };

    function next(ptm ,thread){
        if(ptm.middleware.every(fn=>fn(ptm.taskList[ptm.pointer]))){
            thread.init(ptm.taskList[ptm.pointer++]);
            thread.run();
        }else if(ptm.threads.every(thread=>['free','fail','error'].indexOf(thread.state)!==-1)){
            ptm.dispatch('load' ,ptm.taskList);
        };
    }

};










