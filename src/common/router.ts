import { ResolverFunction } from "../types";
import { Task, WorkResult, ErrInfo } from "../types"
import BaseResolver from "../resolvers/base"
import SugarResolver from "../resolvers/sugar"
import { ErrType } from "./common";

/**
 * Task router
 * @class
 */
export class Router {
    /**
     * Route task to resolvers and execute it
     * @param task the task to complete
     * @param gotWork @see ResolverFunction
     * @param addTask @see ResolverFunction
     * @param reportErr @see ResolverFunction
     */
    static async executeTask(
        task: Task,
        cbs: {
            gotWork: (work: WorkResult)=>void,
            addTask: (task: Task)=>void,
            reportErr: (err: ErrInfo)=>void,
        }
    ):Promise<void> {
        let func = task.Directive.split("::")[0]
        if (func in BaseResolver) {
            return await BaseResolver[func](task, cbs)
        } else if (func in SugarResolver) {
            return await SugarResolver[func](task, cbs)
        }
        cbs.reportErr({
            fatal: true,
            type: ErrType.ResolverNotFound,
            extraMsg: `Unknown task directive ${task.Directive} with resolved func name ${func}`,
            rawErr: null,
        })
    }
}