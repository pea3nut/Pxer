import { ResolverFunction } from "../types";
import { Task, WorkResult, ErrInfo } from "../types"
import BaseResolver from "../resolvers/base"
import SugarResolver from "../resolvers/sugar"
import { ErrType } from "./error";

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
    static route(
        task: Task,
        gotWork: (work: WorkResult)=>void,
        addTask: (task: Task)=>void,
        reportErr: (err: ErrInfo)=>void,
    ):Promise<void> {
        let func = task.Directive.split("::")[0]
        if (func in BaseResolver) {
            return BaseResolver[func](task, gotWork, addTask, reportErr)
        } else if (func in SugarResolver) {
            return SugarResolver[func](task, gotWork, addTask, reportErr)
        }
        reportErr({
            fatal: true,
            type: ErrType.ResolverNotFound,
            extraMsg: `Unknown task directive ${task.Directive} with resolved func name ${func}`,
            rawErr: null,
        })
        return async function(){}()
    }
}