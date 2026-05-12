import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";

import { getUser } from "../auth/users.js";

import os from "os";
import si from "systeminformation";

export class Process {
    constructor(p) {

    }

    toggle() {
        if (this.running) this.stop();
        else this.start();
    }

    start() {
        console.log("starting " + this.name);
    }

    stop() {
        console.log("stopping " + this.name);
    }
}

export class VPS {
    constructor(onUpdate = null) {
        this.onUpdate = onUpdate;

        this.cpu = [];
        this.ram = [];
        this.up = [];
        this.down = [];
        this.mem = [];

        // for (let i = 0; i < 20; i++) {
        //     const p = {
        //         x: Date.now() - i * 1000,
        //         y: 0
        //     };

        //     this.cpu.push({ ...p });
        //     this.ram.push({ ...p });
        //     this.up.push({ ...p });
        //     this.down.push({ ...p });
        //     this.mem.push({ ...p });
        // }
    }

    push(arr, value) {
        const point = {
            x: Date.now(),
            y: value
        };

        arr.push(point);

        while (arr.length > 5) {
            arr.shift();
        }

        return point;
    }

    async update() {
        si.currentLoad().then(load => {
            this.push(
                this.cpu,
                load.currentLoad
            )
        });

        si.mem().then(mem => {
            this.push(
                this.ram,
                (mem.used / mem.total) * 100
            )
        });

        si.networkStats().then(net => {
            this.push(
                this.up,
                net[0]?.tx_sec || 0
            )
            this.push(
                this.down,
                net[0]?.rx_sec || 0
            )
        });

        si.fsSize().then(fs => {
            this.push(
                this.mem,
                fs[0]
                    ? (fs[0].used / fs[0].size) * 100
                    : 0
            )
        });

        const now = new Date();
        const getDeltaT = (t) => (t - now) / 1000

        const data = {
            cpu: this.cpu.map(p => { return { x: getDeltaT(p.x), y: p.y } }),

            ram: this.ram.map(p => { return { x: getDeltaT(p.x), y: p.y } }),

            up: this.up.map(p => { return { x: getDeltaT(p.x), y: p.y } }),

            down: this.down.map(p => { return { x: getDeltaT(p.x), y: p.y } }),

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
    app.use(bodyParser.json());
    app.use(cookieParser());

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
            type: "vps",
            data
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
    }, 4000);
};