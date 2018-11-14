import { Task, WorkResult, ErrInfo } from "./types";
export default class PxerEngine {
    private threadCount;
    private tm;
    run(task: Task): void;
    private _push;
    private workListeners;
    private errListeners;
    private endListeners;
    on(event: "work", listener: (work: WorkResult) => any): this;
    on(event: "error", listener: (work: ErrInfo) => any): this;
    on(event: "end", listener: () => any): this;
    private _emit;
}
