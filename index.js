import express from 'express'
import expressWs from 'express-ws'
import { Process, processes, loadConfig } from './process.js';
const {app, wsRoute} = expressWs(express())
let options = {"port": 8085};
import pidusage from "pidusage";

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith("--")) {
    options[process.argv[i].substring(2)] = process.argv[i+1];
    i+=2;
  }
}

loadConfig("../processes.json");

for (let i = 0; i < processes.length; i++) {
  if (processes[i].autoStart) processes[i].toggle();
}

app.use(express.static('public'))

app.get('/processes', (req, res) => {
  //loadConfig("../processes.json");
  res.send(processes);
  // console.log(processes);
});

app.use(express.json());

app.post('/command', (req, res) => {
  console.log(req.body);

  let p;
  for (let i = 0; i < processes.length; i++) {
    if (processes[i].name == req.body.process) p = processes[i];
  }

  if (!p) {res.send("x"); return;}
  
  p.stop();

  setTimeout(() => {p.start()}, 5000);

  res.send("x");
});

let y = 1;

app.ws('/data', (ws, req) => {
  setInterval(() => {
    for (let i = 0; i < processes.length; i++) {
      if (processes[i].statusChange) {
        let data = {path: "status", data: {name: processes[i].name, running: processes[i].running}};
        ws.send(JSON.stringify(data));
        processes[i].statusChange = false;
      }
      if (processes[i].out.length > 0) {
        let data = {path: "log", data: {name: processes[i].name, log: processes[i].out}};
        ws.send(JSON.stringify(data));
        processes[i].out = "";
      }
      {
        pidusage(processes[i].proc.pid, function (err, stats) {
          // if (err) console.error(err);
          if (stats) {
            processes[i].stats = stats;
            let data = {path: "recources", data: {name: processes[i].name, type: 0, x: new Date().toISOString(), y: processes[i].stats.cpu}};
            ws.send(JSON.stringify(data));
            let data2 = {path: "recources", data: {name: processes[i].name, type: 1, x: new Date().toISOString(), y: processes[i].stats.memory / 160000000}};
            ws.send(JSON.stringify(data2));
          }
        });
      }
    }
  }, 200);
})

app.listen(options.port, () => {
  console.log(`KlimPI running on port ${options.port}`)
})