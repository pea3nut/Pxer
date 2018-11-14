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
        define(["require", "exports", "chai", "mocha", "../../src/common/network"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const chai_1 = require("chai");
    const mocha_1 = require("mocha");
    const network_1 = require("../../src/common/network");
    mocha_1.describe("Networking", () => {
        it("baidu", () => {
            return function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let res = yield network_1.default.get("https://www.baidu.com/");
                    chai_1.expect(res).to.contain("baidu");
                });
            }();
        });
    });
});
//# sourceMappingURL=node.js.map