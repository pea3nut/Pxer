import { ResolverFunction, Task, TaskPayloadBase} from "../types";
import { ErrType } from "../common/error"

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
    }
} as {[name: string]: ResolverFunction}
