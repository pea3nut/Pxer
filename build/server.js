const express = require('express');
const fs = require('fs');
const path = require('path');
const program = require('commander');

program
    .option('-m, --mode <mode>', "server mode")
    .option('-a, --addr <addr>', "bind address")
    .option('-p, --port <port>', "bind port")

program.parse(process.argv);

if (['dev','release', undefined].indexOf(program.mode)===-1) {
    throw new Error("Invalid mode:"+ program.mode);
}
const MODE = program.mode || "dev";
const ADDR = program.addr || "127.0.0.1";
const PORT = parseInt(program.port) || 8125;

console.log("Running server in " +MODE)

var app = express();

app.get('/', (req, res) => res.status(303).send("http://pxer.pea3nut.org/"));

addFile =function(fpath, uri) {
    fpath = path.normalize(fpath);
    var contentType = "text/plain";
    switch (path.extname(fpath)) {
        case ".js"  : contentType = "text/javascript"; break;
        case ".html": contentType = "text/html"; break;
        case ".css" : contentType = "text/css"; break;
    }
    var options = {
        dotfiles: 'deny',
        cacheControl: true,
        headers : {
            "Access-Control-Allow-Origin": "*",
            "Content-Type"               : contentType,
        },
    };
    switch (MODE) {
        case "dev"    : options.headers['Cache-Control'] = "no-store, must-revalidate"; break;
        case "release": options.headers['Cache-Control'] = "max-age=1200"; break;
    };
    app.get(uri, (req, res)=>res.sendFile(fpath, options));
}

addFolder =function(fpath, uri) {
    fs.readdir(fpath, function(err, filelist) {
        if (err) {
            console.log("Error while preloading folder:" +err.message);
        } else {
            filelist.forEach(function(fn) {
                var filepath = path.join(fpath, fn);
                fs.stat(filepath, function(err, info) {
                    if (err) {
                        console.log("Error while reading" + filepath + err.message);
                    } else {
                        switch (true) {
                            case info.isDirectory(): addFolder(filepath, uri + fn + "/"); break;
                            case info.isFile():      addFile(filepath, uri + fn); break;
                        }
                    }
                })
            })
        }
    })
}
addFolder(__dirname +"/../src/", "/src/");
addFolder(__dirname +"/../dist/", "/dist/");
addFile(__dirname +"/../jsonp.js", "/jsonp.js");
addFile(__dirname +"../pxer-dev.user.js", "/pxer-dev.user.js");
addFile(__dirname +"../pxer-master.user.js", "/pxer-master.user.js");

app.listen(PORT, ADDR, function () {
    console.log('Server running at ' + ADDR +":"+ PORT);
})
