import http from 'http';
import https from 'https';
import httpProxy from 'http-proxy';
import fs from 'fs';
import { proxyAuthentication } from '../auth/users.js';

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
        key: fs.readFileSync('/etc/letsencrypt/live/klimdanick.nl/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/klimdanick.nl/fullchain.pem')
    };
} catch (err) {
    try {
        options = {
            key: fs.readFileSync('./certs/privkey.pem'),
            cert: fs.readFileSync('./certs/fullchain.pem')
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
        let proxyData = data["proxy"] || [];

        proxyData.sort((a, b) => b.url.length - a.url.length);

        for (let i = 0; i < proxyData.length; i++) {
            let p = proxyData[i];
            let target = p.port;
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    addExpressHelpers(req, res);

    proxyAuthentication(req, res, () => {

        // your proxy logic here
        // console.log(`Request: ${req.url} from ${req.socket.remoteAddress}`);

        let targetMap = loadTargetMap();

        const target = Object.keys(targetMap).find((prefix) =>
            req.url.toLowerCase().startsWith(prefix.toLowerCase())
        );

        let splitIndex = target ? target.length : 0;

        if (target && target.endsWith("/")) {
            splitIndex -= 1;
        }

        let proxyTargetPort = target ? targetMap[target] : defaultTarget;
        
        if (req.headers.host.toLowerCase().startsWith("dev")) proxyTargetPort = "" + (parseInt(proxyTargetPort) + 1000);
        
        // console.log(proxyTargetPort);
        
        const proxyTarget = `http://localhost:${proxyTargetPort}`

        if (splitIndex >= 0) {
            req.url = req.url.slice(splitIndex);
        }

        // console.log(`Proxying to: ${proxyTarget}${req.url}`);
        if (target != "/elementaljs")
            console.log(`${req.method} ${target} ${req.url} -> ${proxyTarget} [${req.user.user}]`);

        if (req.user) {
            req.headers['x-user'] = JSON.stringify(req.user);
        }

        proxy.web(req, res, {
            target: proxyTarget
        });
    });
};

const server = options
    ? https.createServer(options, requestHandler)
    : http.createServer(requestHandler);

server.on('upgrade', async (req, socket, head) => {
    try {
        console.log(`WebSocket Upgrade: ${req.url}`);

        // add cookie parser
        req.cookies = parseCookies(req.headers.cookie);

        // fake minimal res object for authorization()
        const res = {
            writeHead: () => {},
            end: () => {}
        };

        // run auth middleware
        await new Promise((resolve) => {
            proxyAuthentication(req, res, resolve);
        });

        let targetMap = loadTargetMap();

        const target = Object.keys(targetMap).find(prefix =>
            req.url.startsWith(prefix)
        );

        let splitIndex = target ? target.length : 0;

        if (target && target.endsWith("/")) {
            splitIndex -= 1;
        }

        const proxyTarget =
            target
                ? targetMap[target]
                : defaultTarget;

        // rewrite path
        if (splitIndex > 0) {
            req.url = req.url.slice(splitIndex);
        }

        // pass user info to backend
        if (req.user) {
            req.headers['x-user'] =
                JSON.stringify(req.user);
        }

        console.log(
            `WS ${target} ${req.url} -> ${proxyTarget}`
        );

        proxy.ws(req, socket, head, {
            target: `http://localhost:${proxyTarget}`,
            changeOrigin: true,
            ws: true
        });

    } catch (err) {
        console.error('WebSocket Upgrade Error:', err);
        socket.destroy();
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
    if (!options) port = 80;
    server.listen(port, () => {
        console.log(`revproxy \t| ${port} \t| ${options ? 'HTTPS' : 'HTTP'}`);
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

export const addProxyEntry = (name, url, port, isDefault = false) => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync("../processes.json"));
    } catch (err) {
        console.error("Error reading processes.json:", err);
        return;
    }

    if (!data.proxy) data.proxy = [];

    if (isDefault) {
        data.proxy.forEach(entry => entry.default = false);
    }

    if (data.proxy.some(entry => entry.name === name)) {
        data.proxy = data.proxy.filter(entry => entry.name !== name);
    }

    data.proxy.push({ name, url, port, default: isDefault });

    try {
        fs.writeFileSync("../processes.json", JSON.stringify(data, null, 2));
        console.log(`Added proxy entry: ${name} -> ${url} (${port})${isDefault ? " [default]" : ""}`);
    } catch (err) {
        console.error("Error writing to processes.json:", err);
    }
}

export const removeProxyEntry = (name) => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync("../processes.json"));
    } catch (err) {
        console.error("Error reading processes.json:", err);
        return;
    }

    if (!data.proxy) data.proxy = [];

    data.proxy = data.proxy.filter(entry => entry.name !== name);

    try {
        fs.writeFileSync("../processes.json", JSON.stringify(data, null, 2));
        console.log(`Removed proxy entry: ${name}`);
    } catch (err) {
        console.error("Error writing to processes.json:", err);
    }
}
