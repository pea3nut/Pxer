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
    function formatIllustType(n) {
        switch (n) {
            case 0:
            case "0":
            case "illust":
                return "illust";
            case 1:
            case "1":
            case "manga":
                return "manga";
            case 2:
            case "2":
            case "ugoira":
                return "ugoira";
        }
        throw new Error("Unknown illust type");
    }
    exports.formatIllustType = formatIllustType;
});
//# sourceMappingURL=illusttype.js.map