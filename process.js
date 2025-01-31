import fs from 'fs';

export class Process {
    constructor(id, name) {
        this.id = id;
        this.name = name;
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
            processes[i] = new Process(processes[i].id, processes[i].name);
        }

        console.log(processes);
    });
}