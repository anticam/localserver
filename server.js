const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();

function getHeadersSize(headers) {
    const headersString = Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\r\n');
    return Buffer.byteLength(headersString, 'utf8');
}

function logRequest({ req, status, bodySize = 0, sentBytes = undefined, ms = undefined }) {
    if (!req || !req.headers) {
        console.error('logRequest called without a valid req object!');
        return;
    }
    const now = new Date().toISOString();
    const headersSize = getHeadersSize(req.headers);
    const payloadSize = headersSize + bodySize;
    let logLine = `[${now}] ${req.method} ${req.url} | status: ${status}`;
    logLine += ` | headers: ${headersSize} bytes | body: ${bodySize} bytes | payload: ${payloadSize} bytes`;
    if (typeof sentBytes === 'number') {
        logLine += ` | sent: ${sentBytes} bytes`;
    }
    if (typeof ms === 'number') {
        logLine += ` | time: ${ms.toFixed(2)} ms`;
    }
    console.log(logLine);
}

const server = http.createServer((req, res) => {
    const startTime = process.hrtime();

    function getElapsedMs() {
        const [s, ns] = process.hrtime(startTime);
        return s * 1e3 + ns / 1e6;
    }

    function endLog(params) {
        const ms = getElapsedMs();
        logRequest({ req, ...params, ms });
    }

    if (req.method === 'GET') {
        let filePath = path.join(root, req.url === '/' ? '/index.html' : req.url);
        filePath = path.normalize(filePath);
        if (!filePath.startsWith(root)) {
            const status = 403;
            const message = 'Access denied';
            res.setHeader('X-Backend-ProcessingTime', getElapsedMs().toFixed(2));
            res.writeHead(status);
            return res.end(message, () => {
                endLog({ status, sentBytes: Buffer.byteLength(message, 'utf8') });
            });
        }
        fs.readFile(filePath, (err, data) => {
            if (err) {
                const status = 404;
                const notFoundMessage = 'File not found';
                res.setHeader('X-Backend-ProcessingTime', getElapsedMs().toFixed(2));
                res.writeHead(status, { 'Content-Type': 'text/plain' });
                return res.end(notFoundMessage, () => {
                    endLog({ status, sentBytes: Buffer.byteLength(notFoundMessage, 'utf8') });
                });
            }
            const status = 200;
            res.setHeader('X-Backend-ProcessingTime', getElapsedMs().toFixed(2));
            res.writeHead(status);
            res.end(data, () => {
                endLog({ status, sentBytes: data.length });
            });
        });
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const status = 200;
            const bodySize = Buffer.byteLength(body, 'utf8');
            // console.log('Received POST data:', body);
            const responseMsg = 'POST request received\n';
            res.setHeader('X-Backend-ProcessingTime', getElapsedMs().toFixed(2));
            res.writeHead(status, { 'Content-Type': 'text/plain' });
            res.end(responseMsg, () => {
                endLog({
                    status,
                    bodySize,
                    sentBytes: Buffer.byteLength(responseMsg, 'utf8'),
                });
            });
        });
    } else {
        const status = 405;
        const message = 'Method not allowed\n';
        res.setHeader('X-Backend-ProcessingTime', getElapsedMs().toFixed(2));
        res.writeHead(status, { 'Content-Type': 'text/plain' });
        res.end(message, () => {
            endLog({ status, sentBytes: Buffer.byteLength(message, 'utf8') });
        });
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
