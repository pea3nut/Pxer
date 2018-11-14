var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../common/error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const error_1 = require("../common/error");
    function getTaskMethod(task) {
        let x = task.Directive.split("::");
        switch (x.length) {
            case 1:
                return "";
            case 2:
                return x[1];
            default:
                throw new Error("Invalid directive");
        }
    }
    exports.default = {
        "mock_sugar": (task, gotWork, addTask, reportErr) => __awaiter(this, void 0, void 0, function* () {
            let method = getTaskMethod(task);
            switch (method) {
                default:
                    addTask({
                        Directive: "mock_sugar::results",
                        Payload: { mock_payload: "pea3nut~~" },
                    });
                    break;
                case "results":
                    if (!task.Payload.mock_payload) {
                        reportErr({
                            fatal: true,
                            type: error_1.ErrType.Unknown,
                            extraMsg: "Payload not transfered",
                            rawErr: null,
                        });
                    }
                    else {
                        addTask({
                            Directive: "mock_work",
                            Payload: {},
                        });
                        addTask({
                            Directive: "mock_work",
                            Payload: {},
                        });
                    }
            }
        })
    };
});
//# sourceMappingURL=sugar.js.map