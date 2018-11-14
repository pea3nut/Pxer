import { Task, WorkResult, ErrInfo } from "./types";
export declare class Router {
    static route(task: Task, gotWork: (work: WorkResult) => void, addTask: (task: Task) => void, reportErr: (err: ErrInfo) => void): Promise<void>;
}
