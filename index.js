import express from 'express'
import expressWs from 'express-ws'
import { Process, processes, loadConfig } from './process.js';
const {app, wsRoute} = expressWs(express())
let options = {"port": 8085};

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
  console.log(processes);
});

let y = 0;

app.ws('/data', (ws, req) => {
  console.log("test");
  setInterval(() => {
    for (let p = 0; p < 3; p++) for (let t = 0; t < 4; t++) {
      let data = {id: p, type: t, x: new Date().toISOString(), y: y};
      ws.send(JSON.stringify(data));
    }
  }, 200);
})

app.listen(options.port, () => {
  console.log(`Example app listening ${options.port}`)
})