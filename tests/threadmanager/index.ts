import { expect } from "chai"
import { describe } from "mocha"
import ThreadManager from "../../src/common/threadmanager";
import { doesNotReject } from "assert";

describe('ThreadManger', () => {
    it("main", ()=>{
        return new Promise<void>((resolve, reject)=>{
            let test_counter = 2
            let remaining = 10
            let mock_task_factory = (n: number) => (done: ()=>void)=>{
                setTimeout(()=>{
                    if (test_counter--<0) {
                        reject("Too many concurrent tasks")
                    }
                    test_counter++
                    --remaining
                    done()
                }, 20)
            }
            let tm = new ThreadManager(2)
            tm.notify(()=>{
                if (remaining!==0) {
                    reject("Tasks are not finished!")
                } else {
                    resolve()
                }
            })
            for (let i =0; i<remaining; i++) {
                tm.register(mock_task_factory(i))
            }
            tm.run()
        })
    })
})
