import { expect } from "chai"
import { describe } from "mocha"

import Resolver from "../../src/resolvers/sugar";
import { Task, TaskPayloadBase } from "../../src/types";

describe('Sugar Resolvers', () => {
    describe("mock_sugar", ()=>{
        it('main', (done) => {
            let task :Task = {
                Directive: "mock_sugar",
                Payload: {},
            }
            Resolver["mock_sugar"](task, ()=>{}, (task)=>{
                if (!task) {
                    throw new Error("Mock subtask returned falsy value.")
                }
                done()
            }, ()=>{})
        })
        it('sub method', (done) => {
            let task :Task = {
                Directive: "mock_sugar::results",
                Payload: {mock_payload: "pea3nut~~"},
            }
            let remaining = 2;
            Resolver["mock_sugar"](task, ()=>{}, (task)=>{
                if (!task) {
                    throw new Error("Mock subtask returned falsy value.")
                }
                if (--remaining==0) done()
            }, (err)=>{
                console.error(err.extraMsg)
            })
        })
    })
})
