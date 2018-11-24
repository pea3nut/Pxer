import { ResolverFunction, Task, TaskPayloadBase} from "../types";
import { ErrType } from "../common/error"
import NetworkAgent from "../common/network";

/*
 * Sugar resolvers
 * Sugar resolvers are desinged for multi-step task resolving and are mainly composed of a switch..case statement.
 * A standard workflow of sugar resolvers:
 *   0: get the method name by splitting the task directive by a double colon
 *   1: switch (method)
 *   2: default: {Perform step one of the task. Call reportErr if errors occured, call addTask to add tasks for future steps with step 1 results written in the Payload.}
 *   3: case {Step2MethodName}: {Perform step two of the task. ...}
 *   4: case {StepNMethodName}: {Works are ready. Call gotWork to report work data or append get_illust_data tasks with the work ID to acquire work details}
 */

function getTaskMethod(task: Task) :string{
    let x = task.Directive.split("::")
    switch (x.length) {
        case 1:
            return ""
        case 2:
            return x[1]
        default:
        throw new Error("Invalid directive")
    }
}

export default {
    "get_user_works": async (task, gotWork, addTask, reportErr) => {

        let method = getTaskMethod(task);
        switch (method) {
            default:
                interface RequestPayload extends TaskPayloadBase {
                    user_id: string,
                    types?: ("illust"|"manga"|"ugoira")[],
                }
                let payload = <RequestPayload>task.Payload
                let url = `https://www.pixiv.net/ajax/user/${payload.user_id}/profile/all`
                let res
                try {
                    res = JSON.parse(await NetworkAgent.get(url))
                } catch (e) {
                    reportErr({
                        fatal: true,
                        type: ErrType.NetworkTimeout,
                        extraMsg: "network error",
                        rawErr: e,
                    })
                }
                if (res) {
                    if (res.error) {
                        reportErr({
                            fatal: true,
                            type: ErrType.Unknown,
                            extraMsg: "ajax api error: "+res.message,
                            rawErr: null,
                        })
                    } else {
                        let data = res.body
                        if (payload.types===undefined||payload.types.includes("illust")||payload.types.includes("ugoira")) {
                            for (let id in data.illusts) {
                                addTask({
                                    Directive: "get_illust_data",
                                    Payload: {illust_id: id, accept_type: payload.types},
                                })
                            }
                        }
                        if (payload.types===undefined||payload.types.includes("manga")) {
                            for (let id in data.manga) {
                                addTask({
                                    Directive: "get_illust_data",
                                    Payload: {illust_id: id, accept_type: payload.types},
                                })
                            }
                        }
                    }
                }
        }
    }
} as {[name: string]: ResolverFunction}
