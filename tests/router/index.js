(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "../../src/router"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mocha_1 = require("mocha");
    const router_1 = require("../../src/router");
    mocha_1.describe('Router', () => {
        it('mock resolver', (done) => {
            let task = {
                Directive: "mock_work",
                Payload: {},
            };
            router_1.Router.route(task, (work) => {
                if (!work) {
                    throw new Error("Mock work returned falsy value.");
                }
                done();
            }, () => { }, () => { });
        });
    });
});
//# sourceMappingURL=index.js.map