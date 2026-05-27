import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";

import { getUser } from "../auth/users.js";

import os from "os";
import si from "systeminformation";

import { processes } from "./process.js"
import { addProxyEntry, removeProxyEntry } from "../proxy/proxy.js";
import fs from "fs";

import { hasAccess } from "../auth/users.js";

export class VPS {
    constructor(onUpdate = null) {
        this.onUpdate = onUpdate;

        this.cpu = [];
        this.ram = [];
        this.up = [];
        this.down = [];
        this.mem = [];

        let now = Date.now();

        for (let i = -20; i <= 0; i += 4) {
            const point = {
                x: now + i * 1000,
                y: 0
            };

            this.cpu.push(point);
            this.ram.push(point);
            this.up.push(point);
            this.down.push(point);
        }

        this.updateDisk();


        setInterval(() => {
            this.updateDisk()
        }, 30000)

        setInterval(() => {
            this.updateData()
        }, 500)

    }

    async updateDisk() {
        try {
            const fs = await si.fsSize()

            this.push(
                this.mem,
                fs[0]
                    ? (fs[0].used / fs[0].size) * 100
                    : 0
            )

        } catch (err) {
            console.error(err)
        }
    }

    async updateData() {
        const [load, mem, net] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.networkStats()
        ])


        this.push(
            this.cpu,
            load.currentLoad
        )

        this.push(
            this.ram,
            (mem.used / mem.total) * 100
        )

        this.push(
            this.up,
            net[0]?.tx_sec || 0
        )
        this.push(
            this.down,
            net[0]?.rx_sec || 0
        )
    }

    push(arr, value) {
        const point = {
            x: Date.now(),
            y: value
        };

        arr.push(point);

        while (arr.length > 500 || (arr[0].x - Date.now()) / 1000 < -25) {
            arr.shift();
        }

        return point;
    }

    async update() {

        const data = {
            cpu: this.cpu,

            ram: this.ram,

            up: this.up,

            down: this.down,

            mem: this.mem.at(-1),
        };

        // send websocket update
        if (this.onUpdate) {
            this.onUpdate(data);
        }
    }
}

export const startAPI = (port = 8089) => {
    const app = express();

    app.use(getUser);
    app.use(cookieParser());
    app.use(express.json());
    app.get("/processes", (req, res) => {
        if (!hasAccess("view_processes", req.user)) {
            return res.status(403).send("forbidden");
        }
        res.json(processes.map(p => {
            return {
                id: 0,
                name: p.name,
                status: p.running ? "running" : "stopped",
                res: {
                    cpu: p.cpu,
                    ram: p.ram,
                }
            }
        }));
    });
    app.post("/start", startProc)
    app.post("/stop", stopProc)
    app.post("/restart", restartProc)
    app.get("/proxy", (req, res) => {
        if (!hasAccess("view_proxy", req.user)) {
            return res.status(403).send("forbidden");
        }
        let data;
        try {
            data = JSON.parse(fs.readFileSync("../processes.json"));
        } catch (err) {
            console.error("Error reading processes.json:", err);
            return res.status(500).send("Error reading proxy configuration");
        }

        res.json(data.proxy || []);
    });
    app.post("/proxy", (req, res) => {
        if (!hasAccess("edit_proxy", req.user)) {
            return res.status(403).send("forbidden");
        }
        const { name, url, port } = req.body;

        if (!name || !url || !port) {
            return res.status(400).send("missing fields");
        }

        addProxyEntry(name, url, port);

        res.status(200).send("");
    });
    app.delete("/proxy", (req, res) => {
        if (!hasAccess("edit_proxy", req.user)) {
            return res.status(403).send("forbidden");
        }
        const { name } = req.body;

        if (!name) {
            return res.status(400).send("missing fields");
        }

        removeProxyEntry(name);

        res.status(200).send("");
    });

    const server = app.listen(port, () => {
        console.log(`mainAPI \t| ${port} \t|`);
    });

    // websocket server
    const wss = new WebSocketServer({ server });

    const clients = new Set();

    wss.on("connection", (ws) => {
        console.log("ws connected");

        clients.add(ws);

        ws.on("close", () => {
            clients.delete(ws);
            console.log("ws disconnected");
        });
    });

    const broadcast = (data) => {
        const json = JSON.stringify({
            data,
            processes: processes.map(p => {
                return {
                    name: p.name,
                    command: p.command,
                    args: p.args,
                    cwd: p.cwd,
                    logFile: p.logFile,
                    running: p.running,
                    restarting: p.restarting,
                    cpu: p.cpu,
                    ram: p.ram,
                }
            })
        });

        for (const client of clients) {
            if (client.readyState === 1) {
                client.send(json);
            }
        }
    };

    const vps = new VPS(broadcast);

    setInterval(async () => {
        try {
            await vps.update();
        } catch (err) {
            console.error(err);
        }
    }, 1000);
};

const startProc = (req, res) => {
    if (!hasAccess("start_processes", req.user)) {
        return res.status(403).send("forbidden");
    }
    let proc;
    for (let i = 0; i < processes.length; i++)
        if (processes[i].name == req.body.proc) proc = processes[i]

    if (!proc) return res.status(500).send("invalid process");

    proc.start();
    res.status(200).send("");
}

const stopProc = (req, res) => {
    if (!hasAccess("stop_processes", req.user)) {
        return res.status(403).send("forbidden");
    }
    let proc;
    for (let i = 0; i < processes.length; i++)
        if (processes[i].name == req.body.proc) proc = processes[i]
    
    if (!proc) return res.status(500).send("invalid process");
    
    proc.stop();
    res.status(200).send("");
}
const restartProc = (req, res) => {
    if (!hasAccess("restart_processes", req.user)) {
        return res.status(403).send("forbidden");
    }
    let proc;
    for (let i = 0; i < processes.length; i++)
        if (processes[i].name == req.body.proc) proc = processes[i]

    if (!proc) return res.status(500).send("invalid process");

    proc.restarting = true;
    proc.stop();
    setTimeout(() => {
        proc.start();
        proc.restarting = false;
    }, 3000)

    res.status(200).send("");
}