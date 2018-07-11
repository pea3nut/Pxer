var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (request, response) {
    
    console.log('request:' + request.url);

    var filePath = __dirname + '/..' + request.url.replace(/([^\?]+?)\?.+$/,"$1");

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(404, { 'Content-Type': 'text/html' });
                    response.end('File not found.', 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Error fetching file: ' + error.message + '\n');
            }
        }
        else {
            response.writeHead(200, {
                'Content-Type'               : contentType,
                'Access-Control-Allow-Origin': "*",
                'Cache-Control'              : 'no-store, must-revalidate'
            });
            response.end(content, 'utf-8');
        }
    });

}).listen(8125, '127.0.0.1');
console.log('\x1b[31mWARN:\x1b[0m This server is only designed for your ease of local development & testing and is NOT SAFE FOR PRODUCTION USE!!');
console.log('Dev Server running at http://127.0.0.1:8125/');
console.log('Please set your PXER_URL in tampermonkey to http://127.0.0.1:8125/')