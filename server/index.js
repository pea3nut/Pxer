const express = require('express');
const process = require('process');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const bodyParser = require('body-parser');
const PxerUtility =require('../build/pxer-utility.js');

const PROJECT_PATH = path.resolve(__dirname, "../");

program
    .option('-c, --cache <yes|no|duration>', "cache max age (example: --cache 10m)", /(no|yes|\d+(m|s|h|d)?)/, "no")
    .option('-a, --addr <addr>', "bind address", "127.0.0.1")
    .option('-p, --port <port>', "bind port", /\d+/, 8125)
    .option('--cert <cert>', "certificate file (omit for http)")
    .option('--key <key>', "private key (omit for http)")
    .option('--ca <chain>', "cert chain file (optional)")
    .option('--analytics', "enable analytics output")

program.parse(process.argv);

const ADDR = program.addr;
const PORT = parseInt(program.port);
const ANALYTICS = program.analytics;
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

/**
 *
 * @param {String} section - [client|server]
 * @param {String} severity - [info|notice|warning|severe]
 * @param {String} event - 事件名称
 * @param {Array}  data - 附加的数据
 */
const writeJSONLog = function(section, severity, event, data) {
    var logdata = {
        section:section,
        severity:severity,
        event:event,
        time:new Date().toISOString(),
        data:data,
    }
    console.log(JSON.stringify(logdata))
}

const credentials = {
	key: program.key ? fs.readFileSync(program.key, 'utf-8') :undefined,
	cert: program.cert? fs.readFileSync(program.cert, 'utf-8') :undefined,
	ca: program.ca? fs.readFileSync(program.ca, 'utf-8') :undefined,
};

var serveHttps = credentials.key && credentials.cert;
var app = express();
app.use(bodyParser.json({limit: '1mb'}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
});

app.get('/', (req, res) => res.status(303).send("http://pxer.pea3nut.org/"));

const addFile =function(fpath, uri, middleware=null) {
    fpath = path.normalize(fpath);
    var options = {
        dotfiles: 'deny',
        cacheControl: true,
        headers : {
            "Cache-Control"              : "max-age="+CACHE_TIME,
        },
    };
    app.get(uri, (req, res)=>{
        if (middleware) middleware(req, res);
        res.sendFile(fpath, options);
    });
}

const addFolder = function _self(fpath, uri, middleware=null) {
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
                    case info.isDirectory(): _self(filepath, uri + fn + "/", middleware); break;
                    case info.isFile(): addFile(filepath, uri + fn, middleware); break;
                }
            })
        })
    })
}
/**
 * 注册客户端统计接口
 * @param {String} event - 事件名称
 * @param {String} severity - [info|notice|warning|severe]
 * @param {Array} fields - 接受的键值
 */
const registerClientAnalytics =function(event="pxer.generic", severity="info", fields=[]){
    for (presetkey of ['uid', 'pxer_mode', 'pxer_version', 'source_addr']) {
        if (fields.indexOf(presetkey)===-1) fields.push(presetkey);
    }
    url = `/stats/${event.replace(/\./g,"/")}`;
    app.post(url, (req,res)=>{
        var decodeddata = req.body;
        decodeddata.source_addr = req.ip;
        logdata = {};
        for (key of fields) {
            logdata[key] = decodeddata[key];
        }
        writeJSONLog("client", severity, event, logdata);
        res.end("OK");
    });
}

addFolder(path.resolve(PROJECT_PATH, "src/"), "/src/");
addFolder(path.resolve(PROJECT_PATH, "dist/"), "/dist/");
addFile(path.resolve(PROJECT_PATH, "pxer-dev.user.js"), "/pxer-dev.user.js");
addFile(path.resolve(PROJECT_PATH, "pxer-master.user.js"), "/pxer-master.user.js");
addFile(path.resolve(PROJECT_PATH, "jsonp.js"), "/jsonp.js", ANALYTICS?(req, res)=>{
    writeJSONLog("client","info","pxer.preload", {
        source_addr:req.ip,
    });
}:null);

if (ANALYTICS) {
    registerClientAnalytics("pxer.app.created","info");
    registerClientAnalytics("pxer.app.load", "info", ['page_type']);
    registerClientAnalytics("pxer.app.start", "info", ['ptm_config','task_option','vm_state']);
    registerClientAnalytics("pxer.app.finish", "info", ['ptm_config', 'task_option', 'error_count']);
    registerClientAnalytics("pxer.app.halt", "info", ['task_count','finish_count']);
    registerClientAnalytics("pxer.app.print", "info", ['result_count', 'pp_config', 'pf_config', 'task_option']);
    registerClientAnalytics("pxer.app.taskoption", "info", ['task_option']);
};

app.get('/pxer-dev-local.user.js', (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(
        PxerUtility.reader(
            fs.readFileSync(path.resolve(PROJECT_PATH, 'build/user.jstpl.ejs')).toString(),
            {
                isLocal: true,
                isDev: true,
                pxerURL: (serveHttps ? "https://" : "http://") + ADDR + ":" + PORT + "/"
            },
        )
    );
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
            },
        )
    );
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
    console.log('\x1b[33mPlease install local Pxer script:\x1b[0m');
    console.log("dev   : "+(serveHttps? "https://" : "http://") + ADDR + ":" + PORT + "/pxer-dev-local.user.js");
    console.log("master: "+(serveHttps? "https://" : "http://") + ADDR + ":" + PORT + "/pxer-local.user.js");
});
