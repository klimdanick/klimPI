import fs from 'fs';

export class Process {
    constructor(id, name, port, location, command, url) {
        this.id = id;
        this.name = name;
        this.port = port;
        this.location = location;
        this.command = command;
        this.url = url;
    }
}

export let processes;

export const loadConfig = (file) => {
    processes = JSON.parse(fs.readFileSync(file))["processes"];
    for (let i = 0; i < processes.length; i++) {
        let p = processes[i];
        processes[i] = new Process(p.id, p.name, p.port, p.location, p.command, p.url);
        console.log(processes[i]);
    }
}