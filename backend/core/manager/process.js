import { spawn } from "node:child_process";
import fs from "node:fs";
import { runInThisContext } from "node:vm";
import os from "os";

export class Process {
    constructor({
        name,
        command,
        args = [],
        cwd = process.cwd(),
        logFile = `/home/ubuntu/logs/${name}.log`,
        statsInterval = 2000
    }) {
        this.name = name;
        this.command = command;
        this.args = args;
        this.cwd = cwd;

        this.logFile = logFile;
        this.statsInterval = statsInterval;

        this.process = null;
        this.running = false;

        this.cpu = 0;
        this.ram = 0;

        this._statsTimer = null;

        processes.push(this)
    }

    toggle() {
        if (this.running) this.stop();
        else this.start();
    }

    start() {
        if (this.running) return;

        console.log(`starting ${this.name}`);

        this.process = spawn(this.command, this.args, {
            cwd: this.cwd,
            detached: false,
            // shell: true
        });

        this.process.on("error", (err) => {
            console.error(err);

            this.running = false;

            this.log(`[PROCESS ERROR] ${err.stack}`);
        });

        this.process.on("spawn", () => {
            this.running = true;
            this.log("Process started");
        });

        // stdout
        this.process.stdout.on("data", (data) => {
            this.log(`[STDOUT] ${data.toString().trim()}`);
        });

        // stderr
        this.process.stderr.on("data", (data) => {
            this.log(`[STDERR] ${data.toString().trim()}`);
        });

        // exit
        this.process.on("close", (code) => {
            this.log(`Process exited with code ${code}`);

            this.running = false;

            if (this._statsTimer) {
                clearInterval(this._statsTimer);
                this._statsTimer = null;
            }
        });

        // start monitoring
        this._startMonitoring();
    }

    stop() {
        if (!this.running || !this.process) return;

        console.log(`stopping ${this.name}`);

        this.process.kill("SIGTERM");

        this.running = false;

        if (this._statsTimer) {
            clearInterval(this._statsTimer);
            this._statsTimer = null;
        }

        this.cpu = 0;
        this.ram = 0;
    }

    async _startMonitoring() {
        this._statsTimer = setInterval(async () => {
            try {
                const usage = await this.getUsage();

                this.cpu = usage.cpu;
                this.ram = usage.ram;

                // this.log(
                //     `[USAGE] CPU: ${this.cpu}% | RAM: ${this.ram} MB`
                // );
            } catch (err) {
                this.log(`[MONITOR ERROR] ${err.message}`);
            }
        }, this.statsInterval);
    }

    async getUsage() {
        if (!this.process?.pid) {
            return {
                cpu: 0,
                ram: 0
            };
        }

        // Linux VPS (recommended)
        return new Promise((resolve, reject) => {
            const pid = this.process.pid;

            const ps = spawn("ps", [
                "-p",
                pid,
                "-o",
                "%cpu,rss"
            ]);

            let output = "";

            ps.stdout.on("data", (data) => {
                output += data.toString();
            });

            ps.on("close", () => {
                try {
                    const lines = output.trim().split("\n");

                    if (lines.length < 2) {
                        return resolve({
                            cpu: 0,
                            ram: 0
                        });
                    }

                    const [cpu, rss] = lines[1]
                        .trim()
                        .split(/\s+/);

                    resolve({
                        cpu: parseFloat(cpu),
                        ram: Math.round(parseInt(rss, 10) / 1024) // KB -> MB
                    });
                } catch (err) {
                    reject(err);
                }
            });

            ps.on("error", reject);
        });
    }

    log(message) {
        const line = `[${new Date().toISOString()}] [${this.name}] ${message}\n`;

        // console.log(this.logFile);
        fs.appendFileSync(this.logFile, line);

        // console.log(line.trim());
    }
}

export class klimPIProc extends Process {
    constructor() {
        super({
            name: "klimPI",
            command: "",
            args: [],
        });

        this.process = process;
        this.running = true;
        this._startMonitoring();
    }

    start() {}
    stop() {}
}

export const processes = []