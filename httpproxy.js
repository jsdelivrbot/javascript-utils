/**
 * Simple local proxy.
 *
 * Installation:
 * 1. Copy this file to any directory.
 * 2. Run "npm install http-proxy" in that same directory.
 * 3. Modify the local listen port via "proxyFromPort".
 * 4. Modify the target web address to proxy to via "proxyTo".
 * 5. Modify "proxyToLocals" if you want to swap in local files
 *    in place of files normally loaded from "proxyTo".
 *
 * Running:
 * Simply run "node httpproxy.js".
 *
 * Acts as a regular proxy, but also lets you swap in local resources, which is very useful for
 * debugging JavaScript etc in a page in situations where you can't easily modify/rebuild the
 * source JavaScript i.e. similar to www.requestly.in, but with local filesystem support
 * and without having to install browser extensions.
 *
 * Default is to proxy port 18080 -> 8080
 */

const proxyFromPort = 21080;
const proxyTo = 'https://ci.blueocean.io';

//
// MODIFY this array. Note you can add a 'headers' object too.
//
// Configure this if you want to proxy a local file on the filesystem i.e. swap in
// a local file for a file on the remote host. Useful for modifying/debugging a remote javascript.
//
// All requests that don't match anything in this array are just proxied to the target server.
//
// - "from" just needs to match the end of the file path i.e. you don't need the full thing.
// - "to" is the path to the local file.
//
const proxyToLocals = [
//     {
//         from: 'jenkins/blueocean/blueocean.js',
//         to: '/Users/tfennelly/projects/blueocean-plugin/blueocean-web/target/classes/io/jenkins/blueocean/blueocean.js',
//         headers: {}
//     }
];

const mimetypes = {
    '.js': 'application/javascript',
    '.css': 'text/css'
};

const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const proxy = httpProxy.createProxyServer({secure: false});
const server = http.createServer(function(req, res) {

    // Check do we want to swap in a local file for the requested file.
    for (let i = 0; i < proxyToLocals.length; i++) {
        const proxyToLocal = proxyToLocals[i];

        if (req.url.endsWith(proxyToLocal.from)) {
            console.log(`Applying proxyToLocal: ${req.url} to ${proxyToLocal.to}`);

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

    // Not swapped for a local file (see above), so just proxy to the target server.
    proxy.web(req, res, { target: proxyTo });
});

server.listen(proxyFromPort);

console.log(`Proxying port ${proxyFromPort} to ${proxyTo}`);
