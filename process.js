import fs from 'fs';
import { spawn } from 'child_process'

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
    }

    toggle() {
        if (this.running) this.stop();
        else this.start();
    }

    start() {
        let args = this.command.replace("${port}", this.port).split(" ");
        let command = args[0];
        args.shift();
        this.proc = spawn(command, args, {cwd: this.location});
        this.running = true;
        console.log(`started ${this.name}`);
        this.proc.stdout.on('data', (data) => {
			this.out += data;
		});

		this.proc.stderr.on('data', (data) => {
			this.out += `[ERROR]: data\n`;
		});

		this.proc.on('close', (code) => {
		  this.out += `process exited with code ${code}\n`;
		  this.running = false;
		}); 
    }

    stop() {
        this.out += `process terminated`;
		terminate(this.proc.pid, err => this.out += `[ERROR]: ${err}\n`);
	}
}

export let processes;

export const loadConfig = (file) => {
    processes = JSON.parse(fs.readFileSync(file))["processes"];
    for (let i = 0; i < processes.length; i++) {
        let p = processes[i];
        p.id = i;
        console.log("p");
        console.log(p);
        processes[i] = new Process(p);
        console.log("process");
        console.log(processes[i]);
    }
}