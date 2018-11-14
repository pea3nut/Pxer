(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ErrType;
    (function (ErrType) {
        ErrType[ErrType["NetworkTimeout"] = 0] = "NetworkTimeout";
        ErrType[ErrType["HTTPCode"] = 1] = "HTTPCode";
        ErrType[ErrType["AccountRestriction"] = 2] = "AccountRestriction";
        ErrType[ErrType["ResolverNotFound"] = 3] = "ResolverNotFound";
        ErrType[ErrType["MethodNotFound"] = 4] = "MethodNotFound";
        ErrType[ErrType["Unknown"] = 5] = "Unknown";
    })(ErrType = exports.ErrType || (exports.ErrType = {}));
});
//# sourceMappingURL=error.js.map