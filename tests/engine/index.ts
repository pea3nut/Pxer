import { expect } from "chai"
import { describe } from "mocha"
import PxerEngine from "../../src";
import { Task } from "../../src/types"

describe("Engine", ()=>{
    it("Single base work", ()=>{
        return new Promise((resolve, reject)=>{
            let eng = new PxerEngine()
            let expect_works = 1
            eng.on("end", ()=>{
                if (expect_works!==0) {
                    reject("Work number is incorrect")
                } else {
                    resolve()
                }
            })
            eng.on("work", ()=>{
                expect_works--
            })
            eng.on("error", (err)=>{
                console.error(err)
            })
            eng.run({
                Directive: "mock_work",
                Payload: {},
            })
        })
    })
    it("Sugar directive", ()=>{
        return new Promise((resolve, reject)=>{
            let eng = new PxerEngine()
            let expect_works = 2
            eng.on("end", ()=>{
                if (expect_works!==0) {
                    reject("Work number is incorrect")
                } else {
                    resolve()
                }
            })
            eng.on("work", ()=>{
                expect_works--
            })
            eng.on("error", (err)=>{
                console.error(err)
            })
            eng.run({
                Directive: "mock_sugar",
                Payload: {mock_payload: "pea3nut"},
            })
        })
    })
})