import "process"
import PxerEngine from "./src/index"
import { writeFileSync, readFileSync } from "fs";

function onSIGINT(f: ()=>void) {
    if (process.platform === "win32") {
        var rl = require("readline").createInterface({
          input: process.stdin,
          output: process.stdout
        });
      
        rl.on("SIGINT", f);
      }
      
      process.on("SIGINT", f);
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
onSIGINT(()=>{
    console.log("Received SIGINT, stopping...")
    eng.save().then((state)=>{
        console.log("Saving progress to progress.json")
        writeFileSync("./progress.json", state)
        console.log("Exiting...")
        process.exit(1)
    })
})

let directive = process.argv[2]
if (directive=="resume") {
    // Resume previous progress
    eng.load(readFileSync("./progress.json").toString())
} else {
    // New task
    let payload = {}
    if (process.argv.length>=4) {
        payload = JSON.parse(process.argv[3])
    }
    eng.start({
        Directive: directive,
        Payload: payload,
    })
}

setTimeout(()=>{}, 86400)