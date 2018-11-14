(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "../../src/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mocha_1 = require("mocha");
    const index_1 = require("../../src/index");
    mocha_1.describe("Engine", () => {
        it("Single base work", () => {
            return new Promise((resolve, reject) => {
                let eng = new index_1.default();
                let expect_works = 1;
                eng.on("end", () => {
                    if (expect_works !== 0) {
                        reject("Work number is incorrect");
                    }
                    else {
                        resolve();
                    }
                });
                eng.on("work", () => {
                    expect_works--;
                });
                eng.on("error", (err) => {
                    console.error(err);
                });
                eng.run({
                    Directive: "mock_work",
                    Payload: {},
                });
            });
        });
        it("Sugar directive", () => {
            return new Promise((resolve, reject) => {
                let eng = new index_1.default();
                let expect_works = 2;
                eng.on("end", () => {
                    if (expect_works !== 0) {
                        reject("Work number is incorrect");
                    }
                    else {
                        resolve();
                    }
                });
                eng.on("work", () => {
                    expect_works--;
                });
                eng.on("error", (err) => {
                    console.error(err);
                });
                eng.run({
                    Directive: "mock_sugar",
                    Payload: { mock_payload: "pea3nut" },
                });
            });
        });
    });
});
//# sourceMappingURL=index.js.map