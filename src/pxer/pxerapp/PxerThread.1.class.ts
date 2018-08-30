import PxerEvent from './PxerEvent.-1.class'
import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from './PxerData.-1'
class PxerThread extends PxerEvent{
    state: PxerThread.PxerThreadStatus
    task?: PxerRequest
    config: PxerThread.IPTConfig
    runtime: PxerThread.IPxerThreadRuntimeParam
    xhr?: XMLHttpRequest

    /**
     * @param {Number} id 线程的ID，便于调试
     * @param {Object} config 线程的配置信息
     * */
    constructor(public id:number=0, config:PxerThread.IPTConfig){
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
        this.state=PxerThread.PxerThreadStatus.free;

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

    };
    static checkRequest(url: string ,html: string) : PxerFailType|true{
        if(!html) return PxerFailType.urlempty;
        if(html.indexOf("_no-item _error") !==-1){
            if(html.indexOf("sprites-r-18g-badge") !==-1) return PxerFailType.r18g;
            if(html.indexOf("sprites-r-18-badge") !==-1) return PxerFailType.r18;
        };
        if(html.indexOf("sprites-mypixiv-badge") !==-1) return PxerFailType.mypixiv;
        return true;
    };

    /**
     * 初始化线程
     * @param {PxerRequest} task
     * */
    init(task: PxerRequest) :void{
        this.task=task;

        this.runtime ={};
        this.state =PxerThread.PxerThreadStatus.ready;

        // 必要的检查
        if(Number.isNaN(+this.config.timeout)||Number.isNaN(+this.config.retry)){
            throw new Error(`PxerThread#init: ${this.id} config illegal`);
        }

        this.runtime.urlList =this.task.url.slice();

    };

    /**运行线程*/
    run() :boolean{
        const URL =(<string[]>this.runtime.urlList).shift();
        if(!URL){
            this.state =PxerThread.PxerThreadStatus.free;
            (<PxerRequest>this.task).completed =true;
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
                this.state =PxerThread.PxerThreadStatus.fail;
                this.dispatch('fail' ,new PxerFailInfo(
                    URL,
                    PxerFailType.timeout,
                    (<PxerRequest>this.task),
                    "XHR timed out."
                ));
                return false;
            }else{
                this.sendRequest(URL);
            }
        });
        XHR.addEventListener("load" ,()=>{
            if(XHR.status.toString()[0]!=='2' &&XHR.status!==304){
                this.state =PxerThread.PxerThreadStatus.fail;
                this.dispatch('fail' ,new PxerFailInfo(
                    URL,
                    PxerFailType.HTTPCode,
                    (<PxerRequest>this.task),
                    `${XHR.status}: ${XHR.statusText}`,
                ));
                return false;
            };
            // 判断是否真的请求成功
            var msg =PxerThread.checkRequest(URL ,XHR.responseText);
            if(msg !==true){
                this.state =PxerThread.PxerThreadStatus.fail;
                this.dispatch('fail' ,{
                    task :this.task,
                    url  :URL,
                    type :msg,
                });
                return false;
            };

            (<PxerRequest>this.task).html[URL] =XHR.responseText;
            this.run.call(this);//递归
            return true;
        });
        XHR.addEventListener("error" ,()=>{
            this.state =PxerThread.PxerThreadStatus.error;
            this.dispatch('error' ,{
                task :this.task,
                url  :URL,
            });
        });

        this.sendRequest(URL);
        return true

    };

    /**
     * 使用PxerThread#xhr发送请求
     * @param {string} url
     * */
    sendRequest(url: string) :void{
        this.state =PxerThread.PxerThreadStatus.running;
        (<XMLHttpRequest>this.xhr).open('GET' ,url ,true);
        // 单副漫画请求需要更改Referer头信息
        if(
            this.task instanceof PxerWorksRequest
            && /mode=big/.test(url)
        ){
            var referer =this.task.url.find(item=>item.indexOf('mode=medium')!==-1);
            var origin  =document.URL;
            if(!referer){
                this.dispatch('error','PxerThread.sendRequest: cannot find referer');
            };
            history.replaceState({} ,"" ,referer);
            (<XMLHttpRequest>this.xhr).send();
            history.replaceState({} ,"" ,origin);
        }else{
            (<XMLHttpRequest>this.xhr).send();
        };
    };
    /**终止线程的执行*/
    stop(): void{
        (<XMLHttpRequest>this.xhr).abort();
    };
};

namespace PxerThread {
    export enum PxerThreadStatus {
        free = "free",
        ready = "ready",
        error = "error",
        fail = "fail",
        running = "running",
    }
    export interface IPTConfig {
        timeout: number,
        retry: number,
    }
    export interface IPxerThreadRuntimeParam {
        urlList ?: string[],
    }
}
export default PxerThread