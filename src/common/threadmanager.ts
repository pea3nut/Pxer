import { runInThisContext } from "vm";

export default class ThreadManager{
    private counter: number = 0;
    private limit: number;
    private pointer: number = -1;
    private tasks: ((done: ()=>void)=>void)[] = [];
    private checking: boolean = false;
    private started: boolean = false;
    
    constructor(count: number) {
        this.limit = count
    }

    public changeThreadCount(count: number) {
        if (count < (count = this.limit)) {
            this._check()
        }
    }

    public register(fn: (done: ()=>void)=>void) :number{
        let res = this.tasks.push(fn) -1
        if (this.started) {
            this._check()
        }
        return res
    }

    public run() :void {
        this.started = true
        this._check()
    }

    private listeners: (()=>any)[] = [];
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