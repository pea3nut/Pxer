(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "../../src/resolvers/sugar"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mocha_1 = require("mocha");
    const sugar_1 = require("../../src/resolvers/sugar");
    mocha_1.describe('Sugar Resolvers', () => {
        mocha_1.describe("mock_sugar", () => {
            it('main', (done) => {
                let task = {
                    Directive: "mock_sugar",
                    Payload: {},
                };
                sugar_1.default["mock_sugar"](task, () => { }, (task) => {
                    if (!task) {
                        throw new Error("Mock subtask returned falsy value.");
                    }
                    done();
                }, () => { });
            });
            it('sub method', (done) => {
                let task = {
                    Directive: "mock_sugar::results",
                    Payload: { mock_payload: "pea3nut~~" },
                };
                let remaining = 2;
                sugar_1.default["mock_sugar"](task, () => { }, (task) => {
                    if (!task) {
                        throw new Error("Mock subtask returned falsy value.");
                    }
                    if (--remaining == 0)
                        done();
                }, (err) => {
                    console.error(err.extraMsg);
                });
            });
        });
    });
});
//# sourceMappingURL=sugar.js.map