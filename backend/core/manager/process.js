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
        }, 4000)

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

        while (arr.length > 20 || (arr[0].x - Date.now()) / 1000 < -25) {
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
    }, 1000);
};
