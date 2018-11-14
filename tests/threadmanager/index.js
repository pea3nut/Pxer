(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "../../src/common/threadmanager"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mocha_1 = require("mocha");
    const threadmanager_1 = require("../../src/common/threadmanager");
    mocha_1.describe('ThreadManger', () => {
        it("main", () => {
            return new Promise((resolve, reject) => {
                let test_counter = 2;
                let remaining = 10;
                let mock_task_factory = (n) => (done) => {
                    setTimeout(() => {
                        if (test_counter-- < 0) {
                            reject("Too many concurrent tasks");
                        }
                        test_counter++;
                        --remaining;
                        done();
                    }, 20);
                };
                let tm = new threadmanager_1.default(2);
                tm.notify(() => {
                    if (remaining !== 0) {
                        reject("Tasks are not finished!");
                    }
                    else {
                        resolve();
                    }
                });
                for (let i = 0; i < remaining; i++) {
                    tm.register(mock_task_factory(i));
                }
                tm.run();
            });
        });
    });
});
//# sourceMappingURL=index.js.map