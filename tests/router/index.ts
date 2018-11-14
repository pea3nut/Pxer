import { expect } from "chai"
import { describe } from "mocha"

import Resolver from "../../src/resolvers/base" ;
import { Task } from "../../src/types";
import { Router } from "../../src/router";

describe('Router', () => {
    it('mock resolver', (done) => {
        let task :Task = {
            Directive: "mock_work",
            Payload: {},
        }
        Router.route(task, (work)=>{
            if (!work) {
                throw new Error("Mock work returned falsy value.")
            }
            done()
        }, ()=>{}, ()=>{})
    })
})
