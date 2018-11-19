import "process"
import PxerEngine from "./src/index"

let directive = process.argv[2]
let payload = {}
if (process.argv.length>=4) {
    payload = JSON.parse(process.argv[3])
}

let eng = new PxerEngine
eng.on("work", (work)=>{
    console.log(work)
})
eng.on("error", (err)=>{
    console.error(err)
})
eng.on("end", ()=>{
    console.log("Exiting...")
    process.exit(0)
})
eng.run({
    Directive: directive,
    Payload: payload,
})

setTimeout(()=>{}, 86400)