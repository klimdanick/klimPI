import http from 'http';
import https from 'https';
import httpProxy from 'http-proxy';
import fs from 'fs';
import { authorization } from '../auth/users.js';
const args = { port: 443 };

for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("--")) {
        args[process.argv[i].substring(2)] = process.argv[i + 1];
        i += 2;
    }
}

let options = null;
try {
    options = {
        key: fs.readFileSync('/etc/letsencrypt/live/vps.klimdanick.nl-0002/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/vps.klimdanick.nl-0002/fullchain.pem')
    };
} catch (err) {
    try {
        options = {
            key: fs.readFileSync('/etc/letsencrypt/live/vps.klimdanick.nl/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/vps.klimdanick.nl/fullchain.pem')
        };
    } catch (err) {
        console.warn("Could not load production certificates, falling back to local certs.");
    }
}

const proxy = httpProxy.createProxyServer({ ws: true });

let defaultTarget = "";

// Function to load target mapping dynamically
const loadTargetMap = () => {
    let targetMap = {};
    try {
        let data = JSON.parse(fs.readFileSync("../processes.json"));
        let processes = data["processes"] || [];
        let proxyData = data["proxy"] || [];

        for (let i = 1; i < processes.length; i++) {
            let p = processes[i];
            if (!p.viaProxy) continue;
            let target = `http://localhost:${p.port}`;
            targetMap[p.url] = target;
            if (p.default) defaultTarget = target;
        }

        for (let i = 0; i < proxyData.length; i++) {
            let p = proxyData[i];
            let target = `http://localhost:${p.port}`;
            targetMap[p.url] = target;
            if (p.default) defaultTarget = target;
        }
    } catch (err) {
        console.error("Error loading processes.json:", err);
    }
    return targetMap;
};

// HTTPS Server with Reverse Proxy, should also support http if options are not provided
const requestHandler = async (req, res) => {

    addExpressHelpers(req, res);

    req.body = await parseBody(req);

    authorization(req, res, () => {

        // your proxy logic here
        // console.log(`Request: ${req.url} from ${req.socket.remoteAddress}`);

        let targetMap = loadTargetMap();

        const target = Object.keys(targetMap).find((prefix) =>
            req.url.startsWith(prefix)
        );

        let splitIndex = target ? target.length : 0;

        if (target && target.endsWith("/")) {
            splitIndex -= 1;
        }

        const proxyTarget = target ? targetMap[target] : defaultTarget;

        if (splitIndex >= 0) {
            req.url = req.url.slice(splitIndex);
        }

        // console.log(`Proxying to: ${proxyTarget}${req.url}`);
        console.log(`${req.method} ${target} ${req.url} -> ${proxyTarget} [${req.user.user}]`);

        proxy.web(req, res, {
            target: proxyTarget
        });
    });
};

const server = options
    ? https.createServer(options, requestHandler)
    : http.createServer(requestHandler);

// WebSocket Support for Socket.IO
server.on('upgrade', (req, socket, head) => {
    console.log(`WebSocket Upgrade: ${req.url}`);

    let targetMap = loadTargetMap();
    const target = Object.keys(targetMap).find((prefix) => req.url.startsWith(prefix));
    let splitIndex = target ? target.length : 0;
    if (target && target.endsWith("/")) splitIndex -= 1;
    const proxyTarget = target ? targetMap[target] : defaultTarget;

    if (splitIndex >= 0) req.url = req.url.slice(splitIndex);

    console.log(`Proxying WebSocket to: ${proxyTarget}${req.url}`);

    try {
        proxy.ws(req, socket, head, {
            target: proxyTarget,
            changeOrigin: true,
            ws: true
        });
    } catch (err) {
        console.error('WebSocket Proxy Error:', err);
    }
});

// Error Handling
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    if (res && !res.headersSent) {
        res.writeHead(502);
        res.end('Bad Gateway');
    }
});

// Start Server

export const startProxy = (port = 443) => {
    server.listen(args.port, () => {
        console.log(`revproxy \t| ${args.port} \t| ${options ? 'HTTPS' : 'HTTP'}`);
    });
}

const parseCookies = (cookieHeader = "") => {
    const cookies = {};

    cookieHeader.split(";").forEach(cookie => {
        const parts = cookie.split("=");
        if (parts.length >= 2) {
            cookies[parts[0].trim()] = decodeURIComponent(parts.slice(1).join("="));
        }
    });

    return cookies;
};

const parseBody = async (req) => {
    return new Promise((resolve) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body || "{}"));
            } catch {
                resolve({});
            }
        });
    });
};

const addExpressHelpers = (req, res) => {
    req.cookies = parseCookies(req.headers.cookie);

    res.cookie = (name, value, options = {}) => {
        let cookie = `${name}=${encodeURIComponent(value)}`;

        if (options.maxAge) {
            cookie += `; Max-Age=${Math.floor(options.maxAge / 1000)}`;
        }

        if (options.httpOnly) {
            cookie += "; HttpOnly";
        }

        if (options.path) {
            cookie += `; Path=${options.path}`;
        }

        res.setHeader("Set-Cookie", cookie);
    };
};