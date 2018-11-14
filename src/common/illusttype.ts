import { illustType } from "../types";

export function formatIllustType(n :any): illustType {
    switch(n) {
        case 0:
        case "0":
        case "illust":
            return "illust"
        case 1:
        case "1":
        case "manga":
            return "manga"
        case 2:
        case "2":
        case "ugoira":
            return "ugoira"
    }
    throw new Error("Unknown illust type")
}