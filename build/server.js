const express = require('express');
const process = require('process');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const PxerUtility =require('./pxer-utility.js');

const PROJECT_PATH = path.resolve(__dirname, "../");

program
    .option('-c, --cache <yes|no|duration>', "cache max age (example: --cache 10m)", /(no|yes|\d+(m|s|h|d)?)/, "no")
    .option('-a, --addr <addr>', "bind address", "127.0.0.1")
    .option('-p, --port <port>', "bind port", /\d+/, 8125)
    .option('--cert <cert>', "certificate file (omit for http)")
    .option('--key <key>', "private key (omit for http)")
    .option('--ca <chain>', "cert chain file (optional)")

program.parse(process.argv);

const ADDR = program.addr;
const PORT = parseInt(program.port);
switch (true) {
    case program.cache === "no": program.cache = "0"; break;
    case program.cache === "yes": program.cache = "1200"; break; // 20m
    case program.cache.endsWith("s"): program.cache = parseInt(program.cache); break;
    case program.cache.endsWith("m"): program.cache = parseInt(program.cache)*60; break;
    case program.cache.endsWith("h"): program.cache = parseInt(program.cache)*3600; break;
    case program.cache.endsWith("d"): program.cache = parseInt(program.cache)*3600*24; break;
    default: program.cache = parseInt(program.cache);
}
const CACHE_TIME = program.cache;

const credentials = {
	key: program.key ? fs.readFileSync(program.key, 'utf-8') :undefined,
	cert: program.cert? fs.readFileSync(program.cert, 'utf-8') :undefined,
	ca: program.ca? fs.readFileSync(program.ca, 'utf-8') :undefined,
};

var serveHttps = credentials.key && credentials.cert;
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
addFolder(path.resolve(PROJECT_PATH, "src/"), "/src/");
addFolder(path.resolve(PROJECT_PATH, "dist/"), "/dist/");
addFile(path.resolve(PROJECT_PATH, "jsonp.js"), "/jsonp.js");
addFile(path.resolve(PROJECT_PATH, "pxer-dev.user.js"), "/pxer-dev.user.js");
addFile(path.resolve(PROJECT_PATH, "pxer-master.user.js"), "/pxer-master.user.js");

app.get('/pxer-dev-local.user.js', (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(
        PxerUtility.reader(
            fs.readFileSync(path.resolve(PROJECT_PATH, 'build/user.jstpl.ejs')).toString(),
            {
                isLocal: true,
                isDev: true,
                pxerURL: (serveHttps ? "https://" : "http://") + ADDR + ":" + PORT + "/"
            }));
});
app.get('/pxer-local.user.js', (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(
        PxerUtility.reader(
            fs.readFileSync(path.resolve(PROJECT_PATH, 'build/user.jstpl.ejs')).toString(),
            {
                isLocal: true,
                isDev: false,
                pxerURL: (serveHttps ? "https://" : "http://") + ADDR + ":" + PORT + "/"
            }));
});

var server = null;

console.log("Cache max age: "+CACHE_TIME+" sec.");

if (serveHttps) {
    console.log("Serving HTTPS");
    server = https.createServer(credentials, app);
} else {
    console.log("Serving HTTP");
    server = http.createServer(app);
}

server.listen(PORT, ADDR, function () {
    console.log('Server running at ' + ADDR + ":" + PORT);
    console.log('\x1b[33mPlease install local Pxer script:');
    console.log("dev   : "+(serveHttps? "https://" : "http://") + ADDR + ":" + PORT + "/pxer-dev-local.user.js");
    console.log("master: "+(serveHttps? "https://" : "http://") + ADDR + ":" + PORT + "/pxer-local.user.js");
});
