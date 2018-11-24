import { ResolverFunction, TaskPayloadBase } from "../types";
import NetworkAgent from "../common/network";
import { ErrType } from "../common/error";
import { formatIllustType } from "../common/illusttype";

/**
 * Base resolvers
 * Base resolvers are designed to perform tasks that could be completed in only one step.
 * A standard workflow of sugar resolvers (example: mock_work):
 *   0: Unpack request payload
 *   1: Perform network request(s) to acquire all data needed
 *   2: Call gotWork with the work data you acquired or reportErr to report errors
 */
export default {
    "mock_work": async (task, gotWork, addTask, reportErr) => {
        gotWork({
            illustID: "12345678",
            illustType: "illust",
            URLs: {
                mini: "",
                thumb: "",
                small: "",
                regular: "",
                original: "",
            }
        })
    },
    "get_illust_data": async (task, gotWork, addTask, reportErr) => {
        interface RequestPayload extends TaskPayloadBase {
            illust_id: string,
            accept_type?: ("illust"|"manga"|"ugoira")[],
        }

        let Payload = <RequestPayload>(task.Payload)
        let id = Payload.illust_id
        let url = "https://www.pixiv.net/ajax/illust/" + id
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
                let type = formatIllustType(data.illustType)
                let ugoirameta
                if (type=="ugoira") {
                    let ret
                    try {
                        ret = JSON.parse(await NetworkAgent.get(url+"/ugoira_meta"))
                    } catch (e) {
                        reportErr({
                            fatal: false,
                            type: ErrType.NetworkTimeout,
                            extraMsg: "network error while acquiring ugoira meta",
                            rawErr: e,
                        })
                    }
                    if (ret) {
                        if (ret.error) {
                            reportErr({
                                fatal: false,
                                type: ErrType.NetworkTimeout,
                                extraMsg: "error while acquiring ugoira meta",
                                rawErr: ret.message,
                            })
                        } else {
                            ugoirameta = ret.body
                        }
                    }
                }
                if (Payload.accept_type===undefined || Payload.accept_type.includes(type)) {
                    gotWork({
                        illustID: data.illustId,
                        illustType: type,
                        URLs: data.urls,
                        UgoiraMeta: ugoirameta,
                    })
                }
            }
        }

    }
} as {[name: string]: ResolverFunction}
