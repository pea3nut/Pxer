(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "../../src/resolvers/base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mocha_1 = require("mocha");
    const base_1 = require("../../src/resolvers/base");
    mocha_1.describe('Base Resolvers', () => {
        mocha_1.describe('mock resolver', () => {
            it('main', (done) => {
                let task = {
                    Directive: "mock_work",
                    Payload: {},
                };
                base_1.default["mock_work"](task, (work) => {
                    if (!work) {
                        throw new Error("Mock work returned falsy value.");
                    }
                    done();
                }, () => { }, () => { });
            });
        });
    });
});
//# sourceMappingURL=base.js.map