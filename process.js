import fs from 'fs';
import { spawn, spawnSync } from 'child_process'

export class Process {
    constructor(p) {
        this.id = p.id || 0;
        this.name = p.name || "New Process";
        this.port = p.port || 1111;
        this.location = "../"+p.location || "../";
        this.command = p.command || "echo started";
        this.url = p.url || "";
        this.viaProxy = p.viaProxy || false;
        this.autoStart = p.autoStart || false;
        this.running = false;
        this.out = "";
        this.statusChange = false;
    }

    toggle() {
        if (this.running) this.stop();
        else this.start();
    }

    start() {
        console.log("starting " + this.name);
        try {
        let args = this.command.replace("${port}", this.port).split(" ");
        let command = args[0];
        args.shift();
        // console.log({location: this.location, command, args});
        this.proc = spawn(command, args, {cwd: this.location});
        this.running = true;
        this.statusChange = true;
        this.startTime = new Date();
        console.log(`started ${this.name}`);
        this.proc.stdout.on('data', (data) => {
			this.out += `${data}\n`;
            spawnSync("echo", data.toString().split(" ").concat([">>", `log.log`]), {cwd: this.location});
            console.log("[" + this.name + "]: " + data.toString());
		});

		this.proc.stderr.on('data', (data) => {
			this.out += `[${this.name}][ERROR]: ${data.toString()}\n`;
            console.log(`[${this.name}][ERROR]: ${data.toString()}\n`);
		});

		this.proc.on('close', (code) => {
		  this.out += `process exited with code ${code}\n`;
		  this.running = false;
		}); 
        } catch(err) {
            console.error();
        }
    }

    stop() {
        console.log("stopping " + this.name);
        this.out += `process terminated`;
		this.proc.kill('SIGINT');
        this.running = false;
        this.statusChange = true;
	}
}

export let processes;