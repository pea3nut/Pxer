import { expect } from "chai"
import { describe } from "mocha"

import Resolver from "../../src/resolvers/base" ;
import { Task } from "../../src/types";

describe('Base Resolvers', () => {
    describe('mock resolver', ()=>{
        it('main', (done) => {
            let task :Task = {
                Directive: "mock_work",
                Payload: {},
            }
            Resolver["mock_work"](task, (work)=>{
                if (!work) {
                    throw new Error("Mock work returned falsy value.")
                }
                done()
            }, ()=>{}, ()=>{})
        })
    })

})
