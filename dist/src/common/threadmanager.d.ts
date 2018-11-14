export default class ThreadManager {
    private counter;
    private limit;
    private pointer;
    private tasks;
    private checking;
    private started;
    constructor(count: number);
    changeThreadCount(count: number): void;
    register(fn: (done: () => void) => void): number;
    run(): void;
    private listeners;
    notify(cb: () => any): void;
    private _do_notify;
    private _check;
}
