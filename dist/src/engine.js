(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./common/threadmanager", "./router"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const threadmanager_1 = require("./common/threadmanager");
    const router_1 = require("./router");
    class PxerEngine {
        constructor() {
            this.threadCount = 5;
            this.tm = new threadmanager_1.default(this.threadCount);
            this.workListeners = [];
            this.errListeners = [];
            this.endListeners = [];
        }
        run(task) {
            this.tm.notify(() => {
                this._emit("end");
            });
            this._push(task);
            this.tm.run();
        }
        _push(task) {
            this.tm.register((done) => {
                router_1.Router.route(task, (work) => {
                    this._emit("work", work);
                }, (task) => {
                    this._push(task);
                }, (err) => {
                    this._emit("error", err);
                }).finally(() => {
                    done();
                });
            });
        }
        on(event, listener) {
            function addListener(list, member) {
                list.push(member);
            }
            switch (event) {
                case "work":
                    addListener(this.workListeners, listener);
                    break;
                case "error":
                    addListener(this.errListeners, listener);
                    break;
                case "end":
                    addListener(this.endListeners, listener);
                    break;
                default:
                    throw new Error("Unknown event type");
            }
            return this;
        }
        _emit(event, data) {
            function callListeners(listeners, data) {
                return listeners.forEach((fn) => { fn(data); });
            }
            switch (event) {
                case "work":
                    callListeners(this.workListeners, data);
                    break;
                case "error":
                    callListeners(this.errListeners, data);
                    break;
                case "end":
                    callListeners(this.endListeners, data);
                    break;
                default:
                    throw new Error("Unknown event type");
            }
        }
    }
    exports.default = PxerEngine;
});
//# sourceMappingURL=engine.js.map