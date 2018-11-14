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
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ThreadManager {
        constructor(count) {
            this.counter = 0;
            this.pointer = -1;
            this.tasks = [];
            this.checking = false;
            this.started = false;
            this.listeners = [];
            this.limit = count;
        }
        changeThreadCount(count) {
            if (count < (count = this.limit)) {
                this._check();
            }
        }
        register(fn) {
            let res = this.tasks.push(fn) - 1;
            if (this.started) {
                this._check();
            }
            return res;
        }
        run() {
            this.started = true;
            this._check();
        }
        notify(cb) {
            this.listeners.push(cb);
        }
        _do_notify() {
            for (let listener of this.listeners) {
                setTimeout(listener, 0);
            }
        }
        _check() {
            if (this.checking) {
                return;
            }
            if (this.counter == 0 && this.pointer == this.tasks.length - 1) {
                this._do_notify();
            }
            this.checking = true;
            while (this.counter < this.limit && this.pointer < this.tasks.length - 1) {
                let task = this.tasks[++this.pointer];
                this.counter++;
                (() => __awaiter(this, void 0, void 0, function* () {
                    task(() => {
                        this.counter--;
                        this._check();
                    });
                }))();
            }
            this.checking = false;
        }
    }
    exports.default = ThreadManager;
});
//# sourceMappingURL=threadmanager.js.map