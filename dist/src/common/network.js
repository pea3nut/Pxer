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
    // @ts-ignore
    const inBrowser = typeof window !== "undefined";
    class NetworkAgent {
        static get(url) {
            return new Promise((resolve, reject) => {
                if (inBrowser) {
                    return function (url) {
                        return __awaiter(this, void 0, void 0, function* () {
                            // @ts-ignore
                            let req = yield fetch(url, { credentials: "include" });
                            return yield req.text();
                        });
                    }(url);
                }
                else {
                    const request = require("request");
                    request({
                        method: "GET",
                        url,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:62.0) Gecko/20100101 Firefox/62.0',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
                            'Cookie': process.env.cookie || process.env.COOKIE,
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1',
                            'Cache-Control': 'max-age=0',
                            'TE': 'Trailers',
                        },
                        gzip: true,
                    }, function (error, response, body) {
                        if (error) {
                            reject(error);
                        }
                        if (![200, 304].includes(response.statusCode)) {
                            reject(new Error(`Network: remote returned ${response.statusCode}.`));
                        }
                        resolve(body.toString());
                    });
                }
            });
        }
    }
    exports.default = NetworkAgent;
});
//# sourceMappingURL=network.js.map