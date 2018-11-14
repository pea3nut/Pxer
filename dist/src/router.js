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
        define(["require", "exports", "./resolvers/base", "./resolvers/sugar", "./common/error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const base_1 = require("./resolvers/base");
    const sugar_1 = require("./resolvers/sugar");
    const error_1 = require("./common/error");
    class Router {
        static route(task, gotWork, addTask, reportErr) {
            let func = task.Directive.split("::")[0];
            if (func in base_1.default) {
                return base_1.default[func](task, gotWork, addTask, reportErr);
            }
            else if (func in sugar_1.default) {
                return sugar_1.default[func](task, gotWork, addTask, reportErr);
            }
            reportErr({
                fatal: true,
                type: error_1.ErrType.ResolverNotFound,
                extraMsg: `Unknown task directive ${task.Directive} with resolved func name ${func}`,
                rawErr: null,
            });
            return function () {
                return __awaiter(this, void 0, void 0, function* () { });
            }();
        }
    }
    exports.Router = Router;
});
//# sourceMappingURL=router.js.map