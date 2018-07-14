const express = require('express');
const process = require('process');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const program = require('commander');

const PROJECT_PATH = path.resolve(__dirname, "../");

program
    .option('-c, --cache <sec>', "cache max age", /\d+/, "0")
    .option('-a, --addr <addr>', "bind address", "127.0.0.1")
    .option('-p, --port <port>', "bind port", /\d+/, 8125)
    .option('--cert <cert>', "certificate file(omit for http)", undefined)
    .option('--key <key>', "private key(omit for http)", undefined)
    .option('--ca <chain>', "cert chain file(optional)", undefined)

program.parse(process.argv);

const ADDR = program.addr;
const PORT = parseInt(program.port);
const CACHE_TIME = program.cache;

const credentials = {
	key: program.cert ? fs.readFileSync(program.cert, 'utf-8') :undefined,
	cert: program.key? fs.readFileSync(program.key, 'utf-8') :undefined,
	ca: program.ca? fs.readFileSync(program.ca, 'utf-8') :undefined,
};

var app = express();

app.get('/', (req, res) => res.status(303).send("http://pxer.pea3nut.org/"));

const addFile =function(fpath, uri) {
    fpath = path.normalize(fpath);
    var options = {
        dotfiles: 'deny',
        cacheControl: true,
        headers : {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control"              : "max-age="+CACHE_TIME,
        },
    };
    app.get(uri, (req, res)=>res.sendFile(fpath, options));
}

const addFolder = function _self(fpath, uri) {
    fs.readdir(fpath, function (err, filelist) {
        if (err) {
            console.log("Error while preloading folder:" + err.message);
            return;
        }
        filelist.forEach(function (fn) {
            var filepath = path.join(fpath, fn);
            fs.stat(filepath, function (err, info) {
                if (err) {
                    console.log("Error while reading" + filepath + err.message);
                    return;
                }
                switch (true) {
                    case info.isDirectory(): _self(filepath, uri + fn + "/"); break;
                    case info.isFile(): addFile(filepath, uri + fn); break;
                }
            })
        })
    })
}
addFolder(PROJECT_PATH +"/src/", "/src/");
addFolder(PROJECT_PATH +"/dist/", "/dist/");
addFile(PROJECT_PATH +"/jsonp.js", "/jsonp.js");
addFile(PROJECT_PATH +"/pxer-dev.user.js", "/pxer-dev.user.js");
addFile(PROJECT_PATH +"/pxer-master.user.js", "/pxer-master.user.js");

var server = null;

console.log("Cache max age: "+CACHE_TIME+" sec.");

if (credentials.key && credentials.cert) {
    console.log("Serving HTTPS");
    server = https.createServer(credentials, app);
} else {
    console.log("Serving HTTP");
    server = http.createServer(app);
}

server.listen(PORT, ADDR, function () {
    console.log('Server running at ' + ADDR + ":" + PORT);
});
