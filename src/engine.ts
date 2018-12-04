import ThreadManager from "./common/threadmanager";
import { Task, Result, ErrInfo, CountResult, WorkResult } from "./types"
import { Router } from "./common/router";

interface PxerEngineState {
    tasks: Task[],
    failures: {
        task: Task,
        err: ErrInfo,
    }[],
} 

/**
 * Pxer Engine
 */
export default class PxerEngine {
    private threadCount: number = 5
    private tm: ThreadManager = new ThreadManager(this.threadCount)
    private state: PxerEngineState = {tasks: [], failures: []}
    
    // Start the execution flow with an initial task
    public start(task: Task) {
        this._push(task)
        this._run()
    }

    public load(states: string, retry?:boolean) {
        let state: PxerEngineState = JSON.parse(states)
        for (let task of state.tasks) {
            this._push(task)
        }
        if (retry) {
            for (let fail of state.failures) {
                this._push(fail.task)
            }
        }
        this._run()
    }

    public async save() :Promise<string> {
        await this.tm.stop()
        return JSON.stringify(this.state)
    }

    private _run() {
        this.tm.notify(()=>{
            this._emit("end")
        })
        this.tm.run()
    }
    
    private _push(task: Task) {
        this.state.tasks.push(task)
        this.tm.register((done: ()=>void) => {
            Router.executeTask(task, {
                gotCount: (count)=>{
                    this._emit("count", count)
                },
                gotWork: (res)=>{
                    this._emit("work", res)
                },
                addTask: (task)=>{
                    this._push(task)
                },
                reportErr: (err)=>{
                    this.state.failures.push({
                        task,
                        err,
                    })
                    this._emit("error", err)
                }
            }).finally(()=>{
                this.state.tasks = this.state.tasks.filter((t: Task)=>t!==task)
                done()
            })
        })
    }
    
    
    private resultListeners: ((res: Result)=>any)[] = [];
    private countListeners: ((count: CountResult)=>any)[] = [];
    private workListeners: ((work: WorkResult)=>any)[] = [];
    private errListeners: ((err: ErrInfo)=>any)[] = [];
    private endListeners: Function[] = [];
    /**
     * Register a listener for result data, emitted together with count and work
     * @param listener Listener function, called every time a piece of result data is ready
     */
    public on(event: "result", listener: (res: Result)=>any) :this;
    public on(event: "count", listener: (count: CountResult)=>any) :this;
    public on(event: "work", listener: (count: WorkResult)=>any) :this;
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
            case "result":
                addListener(this.resultListeners, listener)
                break
            case "count":
                addListener(this.countListeners, listener)
                break
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
    private _emit(event: "count", count: CountResult) :void;
    private _emit(event: "work", work: WorkResult) :void;
    private _emit(event: "error", err: ErrInfo) :void;
    private _emit(event: "end") :void;
    private _emit(event: string, data?: any) :void{
        function callListeners(listeners: Function[], data: any) {
            return listeners.forEach((fn)=>{fn(data)})
        }
        switch (event) {
            case "count":
                callListeners([...this.resultListeners, ...this.countListeners], data)
                break
            case "work":
                callListeners([...this.resultListeners, ...this.workListeners], data)
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