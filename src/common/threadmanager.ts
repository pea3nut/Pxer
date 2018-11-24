/**
 * Multitasking manager
 * @class
 */
export default class ThreadManager{
    // Active thread count
    private counter: number = 0;
    // Active thread limit
    private limit: number;
    // Current task pointer
    private pointer: number = -1;
    // Task list
    private tasks: ((done: ()=>void)=>void)[] = [];
    // sync mutex for _check
    private checking: boolean = false;
    private started: boolean = false;
    
    constructor(count: number) {
        this.limit = count
    }

    /**
     * Change the active thread count
     * @param count 
     */
    public changeThreadCount(count: number) {
        if (count < (count = this.limit) && this.started) {
            // We are increasing the thread count. So try to initiate new tasks.
            this._check()
        }
    }

    /**
     * Register new task
     * @param fn New task func to execute. Call done after completion.
     */
    public register(fn: (done: ()=>void)=>void) :number{
        let res = this.tasks.push(fn) -1
        if (this.started) {
            this._check()
        }
        return res
    }

    /**
     * Starts the flow
     */
    public run() :void {
        this.started = true
        this._check()
    }

    private listeners: (()=>any)[] = [];
    /**
     * Register a callback when all tasks are done
     * @param cb Callback function
     */
    public notify(cb: ()=>any) :void {
        this.listeners.push(cb)
    }

    private _do_notify() :void{
        for (let listener of this.listeners) {
            setTimeout(listener, 0)
        }
    }

    private _check() :void {
        if (this.checking) {
            return
        }

        if (this.counter==0 && this.pointer == this.tasks.length - 1) {
            // All tasks completed
            this._do_notify()
        }
        
        this.checking = true
        
        while (this.counter<this.limit && this.pointer < this.tasks.length-1) {
            let task = this.tasks[++this.pointer];
            
            this.counter++
            (async ()=>{
                task(()=>{
                    this.counter--
                    this._check()
                })
            })()
        
        }
        
        this.checking = false
    }
}