/**
 * Simple local proxy.
 *
 * Installation:
 * 1. Copy this file to any directory.
 * 2. Run "npm install http-proxy" in that same directory.
 *
 * Running:
 * Simply run "node httpproxy.js".
 *
 * Configuration is done in this file itself i.e. just change the script :)
 *
 * Acts as a regular proxy, but also lets you swap in local resources, which is very useful for
 * debugging JavaScript etc in a page in situations where you can't easily modify/rebuild the
 * source JavaScript i.e. similar to www.requestly.in, but with local filesystem support
 * and without having to install browser extensions.
 *
 * Default is to proxy port 18080 -> 8080
 */

//
// MODIFY this array. Note you can add a 'headers' object too.
//
const proxyToLocals = [
    {
        from: '/scripts/hudson-behavior.js',
        to: '/Users/tfennelly/projects/jenkins/war/src/main/webapp/scripts/hudson-behavior.js'
    }
];

const proxyFromPort = 18080;
const proxyToPort = 8080;

const mimetypes = {
    '.js': 'application/javascript',
    '.css': 'text/css'
};

const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const proxy = httpProxy.createProxyServer({});
const server = http.createServer(function(req, res) {

    for (let i = 0; i < proxyToLocals.length; i++) {
        const proxyToLocal = proxyToLocals[i];

        if (req.url.endsWith(proxyToLocal.from)) {
            console.log(`Applying proxyToLocal: ${proxyToLocal.from} -> ${proxyToLocal.to}`);

            const body = fs.readFileSync(proxyToLocal.to, "utf-8");
            const headers = {
                'Server': `Local-resource-proxy: ${__filename}`,
                'Content-Type': mimetypes[path.extname(proxyToLocal.to)],
                'Content-Length': Buffer.byteLength(body)
            };

            if (proxyToLocal.headers) {
                Object.assign(headers, proxyToLocal.headers);
            }

            res.writeHead(200, headers);
            res.write(body);
            res.end('ok');

            return;
        }
    }

    proxy.web(req, res, { target: `http://localhost:${proxyToPort}` });
});

server.listen(proxyFromPort);

console.log(`Proxying port ${proxyFromPort} to localhost:${proxyToPort}`);
