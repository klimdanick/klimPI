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
  try {
    if (processes[i].autoStart) processes[i].start();
  } catch (err) {
    console.error(`[${processes[i].name}]: ${err}`);
  }
}

app.use(express.static('public'))

app.get('/processes', (req, res) => {
  res.send(processes);
});

app.get('/proxy', (req, res) => {
  res.send(proxy);
});

app.use(express.json());

app.post('/command', (req, res) => {
  console.log(req.body);

  let p;
  for (let i = 0; i < processes.length; i++) {
    if (processes[i].name == req.body.process) p = processes[i];
  }

  if (!p) {res.send("x"); return;}
  
  if (req.body.command == "restart") {
    p.stop();

    setTimeout(() => {p.start()}, 5000);

    res.send("x");
    return;
  }
  if (req.body.command == "start") {
    p.start();
    res.send();
  }
  if (req.body.command == "stop") {
    p.stop();
    res.send();
  }
  if (req.body.command == "toggle") {
    p.toggle();
    res.send();     
  }
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
        if (processes[i].proc)
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

const loadConfig = (file) => {
  processes = JSON.parse(fs.readFileSync(file))["processes"];
  for (let i = 0; i < processes.length; i++) {
    let p = processes[i];
    if (p.location == "klimPI") {
      processes.splice(i, 1);
      i--;
      continue;
    }
    p.id = i;
    processes[i] = new Process(p);
    if (p.viaProxy) proxy[p.id] = new Proxy(p);
  }
  
  let proxy_ = JSON.parse(fs.readFileSync(file))["proxy"];

  for (let i = 0; i < proxy_.length; i++) {
    let p = proxy_[i];
    p.id = i+processes.length;
    proxy[p.id] = new Proxy(p);
  }
}