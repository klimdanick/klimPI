import express from 'express';
import { Process } from '../../core/manager/process.js'

export class staticWeb extends Process {
    constructor(port = 80, location = "../frontend", name) {
        super({
            name: name,
            command: "",
        })
        this.cwd = null;
        this.port = port;
        this.location = location;

        this.server = express();
        this.server.use(express.static(location));
    }


    start() {
        if (this.running) return;

        this.running = true;
        this.log(`staticWeb \t| ${this.port} \t| ${this.location}`);
        this.server.listen(this.port);
    }

    stop() {
        if (!this.running || !this.process) return;

        this.log(`stopping ${this.name}`);

        this.server.close();

        this.running = false;
    }

    async _startMonitoring() {
        this.cpu = 0;
        this.ram = 0;
    }

    async getUsage() {
        return {
            cpu: 0,
            ram: 0
        };
    }
}

