import ThreadManager from "./common/threadmanager";
import { Task, WorkResult, ErrInfo } from "./types"
import { Router } from "./common/router";
/**
 * Pxer Engine
 */
export default class PxerEngine {
    private threadCount: number = 5
    private tm: ThreadManager = new ThreadManager(this.threadCount)
    
    // Start the execution flow with an initial task
    public run(task: Task) {
        this.tm.notify(()=>{
            this._emit("end")
        })
        this._push(task)
        this.tm.run()
    }
    
    private _push(task: Task) {
        this.tm.register((done: ()=>void) => {
            Router.executeTask(task, {
                gotWork: (work)=>{
                    this._emit("work", work)
                },
                addTask: (task)=>{
                    this._push(task)
                },
                reportErr: (err)=>{
                    this._emit("error", err)
                }
            }).finally(()=>{
                done()
            })
        })
    }
    
    
    private workListeners: ((work: WorkResult)=>any)[] = [];
    private errListeners: ((err: ErrInfo)=>any)[] = [];
    private endListeners: Function[] = [];
    /**
     * Register a listener for work data
     * @param listener Listener function, called every time a piece of work data is ready 
     */
    public on(event: "work", listener: (work: WorkResult)=>any) :this;
    /**
     * Register a listen for errors
     * @param listener Listener function, called every time an error occured
     */
    public on(event: "error", listener: (work: ErrInfo)=>any) :this;
    /**
     * Register a listener for end of process
     * @param listener Listener function, called when all tasks are resolved
     */
    public on(event: "end", listener: ()=>any) :this;
    public on(event: string, listener: Function) :this{
        function addListener(list: Function[], member: Function) {
            list.push(member)
        }
        switch (event) {
            case "work":
                addListener(this.workListeners, listener)
                break
            case "error":
                addListener(this.errListeners, listener)
                break
            case "end":
                addListener(this.endListeners, listener)
                break
            default:
                throw new Error("Unknown event type")
        }
        return this
    }
    private _emit(event: "work", work: WorkResult) :void;
    private _emit(event: "error", err: ErrInfo) :void;
    private _emit(event: "end") :void;
    private _emit(event: string, data?: any) :void{
        function callListeners(listeners: Function[], data: any) {
            return listeners.forEach((fn)=>{fn(data)})
        }
        switch (event) {
            case "work":
                callListeners(this.workListeners, data)
                break
            case "error":
                callListeners(this.errListeners, data)
                break
            case "end":
                callListeners(this.endListeners, data)
                break
            default:
                throw new Error("Unknown event type")
        }
    }
}