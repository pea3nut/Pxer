import { expect } from "chai"
import { describe } from "mocha"
import NetworkAgent from "../../src/common/network";

describe("Networking", ()=>{
    it("baidu", ()=>{
        return async function () :Promise<void>{
            let res = await NetworkAgent.get("https://www.baidu.com/");
            expect(res).to.contain("baidu")
        }()
    })
})