import express from 'express'
import { Process, processes, loadConfig } from './process.js';
const app = express()
const port = 8085

app.use(express.static('public'))

app.get('/processes', (req, res) => {
  console.log("p");
  loadConfig("processes.json");
  res.send(processes);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });
})