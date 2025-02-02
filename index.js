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

console.log(options);

app.use(express.static('public'))

app.get('/processes', (req, res) => {
  console.log("p");
  loadConfig("../processes.json");
  let resInt = setInterval(() => {
    if (processes.length > 0) {
      res.send(processes);
      clearInterval(resInt);
    }
  }, 10);
  setTimeout(() => {
    try {
      clearInterval(resInt);
      res.send(processes);
    } catch(err) {}
  }, 5000);
})

let y = [];
for (let i = 0; i < 12; i++) y[i]=0;

app.ws('/data', (ws, req) => {
  console.log("test");
  setInterval(() => {
    for (let p = 0; p < 3; p++) for (let t = 0; t < 2; t++) {
      let data = {id: p, type: t, x: new Date().toISOString(), y: y[p*4+t]+=Math.random()*2-1};
      ws.send(JSON.stringify(data));
    }
  }, 200);
})

app.listen(options.port, () => {
  console.log(`Example app listening ${options.port}`)
})