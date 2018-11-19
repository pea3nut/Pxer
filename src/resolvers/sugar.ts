import { ResolverFunction, Task, TaskPayloadBase} from "../types";
import { ErrType } from "../common/error"
import NetworkAgent from "../common/network";

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
    "mock_sugar": async (task, gotWork, addTask, reportErr) => {
        interface ResultPayload extends TaskPayloadBase {
            mock_payload: string,
        }
        
        let method = getTaskMethod(task);
        switch(method){
            default:
                addTask({
                    Directive: "mock_sugar::results",
                    Payload: {mock_payload: "pea3nut~~"},
                })
                break
            case "results":
                if (!(<ResultPayload>task.Payload).mock_payload) {
                    reportErr({
                        fatal: true,
                        type: ErrType.Unknown,
                        extraMsg: "Payload not transfered",
                        rawErr: null,
                    })
                } else {
                    addTask({
                        Directive: "mock_work",
                        Payload: {},
                    })
                    addTask({
                        Directive: "mock_work",
                        Payload: {},
                    })
                }
        }
    },
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
                                    Payload: {illust_id: id, accept_types: payload.types},
                                })
                            }
                        }
                        if (payload.types===undefined||payload.types.includes("manga")) {
                            for (let id in data.manga) {
                                addTask({
                                    Directive: "get_illust_data",
                                    Payload: {illust_id: id, accept_types: payload.types},
                                })
                            }
                        }
                    }
                }
        }
    }
} as {[name: string]: ResolverFunction}
