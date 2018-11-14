import { ResolverFunction } from "../types";

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
    }
} as {[name: string]: ResolverFunction}
