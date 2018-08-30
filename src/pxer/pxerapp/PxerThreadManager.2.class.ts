import PxerEvent from './PxerEvent.-1.class'
import PxerThread from './PxerThread.1.class'
import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from './PxerData.-1'
class PxerThreadManager extends PxerEvent{
    threads: PxerThread[];
    pointer: number;
    taskList: PxerRequest[];
    middleware: PxerThreadManager.IPTMBeforeMiddleWare[];
    finishmiddleware: PxerThreadManager.IPTMFinishMiddleWare[];
    /**
     * @param {number} timeout - 超时时间
     * @param {number} retry   - 重试次数
     * @param {number} thread  - 线程数
     * */
    constructor(public config: PxerThreadManager.IPTMConfig={timeout:5000,retry:3,thread:8}){
        super(['load' ,'error' ,'fail' ,'warn','tick']);

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
        /**
         * 任务结束中间件
         */
        this.finishmiddleware =[];

    };

    /**
     * 运行线程管理器
     * */
    run() :boolean{
        if(this.taskList.length ===0){
            this.dispatch('warn','PxerApp#run: taskList.length is 0');
            this.dispatch('load',[]);
            return false;
        };



        for(let thread of this.threads){

            thread.on('load' ,data=>{
                this.finishmiddleware.forEach(mdw=>mdw(this, <PxerRequest>data))
                next(this,thread);
            });
            thread.on('fail' ,(pfi)=>{
                this.dispatch('fail',pfi);
                next(this,thread);
            });
            thread.on('error' ,this.dispatch.bind(this ,'error'));


            next(this,thread);

        };
        return true

        function next(ptm :PxerThreadManager ,thread: PxerThread) :void{
            ptm.dispatch("tick");
            if(ptm.middleware.every(fn=>fn(ptm.taskList[ptm.pointer]))){
                thread.init(ptm.taskList[ptm.pointer++]);
                thread.run();
            }else if(ptm.threads.every(thread=>[
                    PxerThread.PxerThreadStatus.free,
                    PxerThread.PxerThreadStatus.fail,
                    PxerThread.PxerThreadStatus.error
              ].indexOf(thread.state)!==-1)){
                ptm.dispatch('load' ,ptm.taskList);
            };
        }

    };

    /**
     * 停止线程的执行，实际上假装任务都执行完了
     * 停止后还会触发load事件，需要一段时间
     * */
    stop() :void{
        this.pointer =this.taskList.length+1;
    };

    /**
     * 初始化线程管理器
     * @param {PxerRequest[]} taskList
     * */
    init(taskList: PxerRequest[]) :PxerThreadManager{

        // 初始任务与结果
        this.taskList=taskList;
        this.pointer =0;

        // 建立线程对象
        this.threads =[];
        for(let i=0 ;i<this.config.thread ;i++){
            this.threads.push(new PxerThread(
                i,
                {
                    timeout :this.config.timeout,
                    retry :this.config.retry,
                },
            ));
        };

        return this;
    };
};

namespace PxerThreadManager {
    export interface IPTMConfig extends PxerThread.IPTConfig{
        thread: number,
    }
    export type IPTMBeforeMiddleWare = ((req: PxerRequest)=>boolean)
    export type IPTMFinishMiddleWare = ((ptm: PxerThreadManager, res: PxerRequest)=>boolean)
}
export default PxerThreadManager