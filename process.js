import fs from 'fs';

export class Process {
    constructor(id, name, port, location, command) {
        this.id = id;
        this.name = name;
        this.port = port;
        this.location = location;
        this.command = command;
    }

    helloWorld() {
        console.log("hello world!");
    }
}

export let processes;

export const loadConfig = (file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
        const jsonData = JSON.parse(data);  // Parse the JSON data
        
        processes = jsonData.processes;

        for (let i = 0; i < processes.length; i++) {
            let p = processes[i];
            processes[i] = new Process(p.id, p.name, p.port, p.location, p.command);
        }

        console.log(processes);
    });
}