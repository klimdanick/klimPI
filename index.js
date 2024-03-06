const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const app = express()
const port = 443
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;

var quotes = readJsonFile("quotes.json")["quotes"];

var https = require('https');
var fs = require('fs');

var https_options = {
	key: fs.readFileSync("/certs/private.key"),
	cert: fs.readFileSync("/certs/certificate.crt"),
	ca: [fs.readFileSync('/certs/ca_bundle.crt')] 
};

https.createServer(https_options, app).listen(port)

console.log("KlimPI is online!");

app.post('/quote', jsonParser, (req, res) => {
	console.log(req.body.auteur + ": " + req.body.quote);
	quotes.push(req.body);
	writeJsonFile("quotes.json", {"quotes": quotes});
	res.send("");
}) 

app.get('/quote', (req, res) => {
	res.send(quotes);
});

app.get('/quoteBoek', (req, res) => {
	res.send("<h1>quoteboek</h1>");
});

function writeJsonFile(file, content) {
  let jsonData = JSON.stringify(content)
  fs.writeFileSync(file, jsonData)
}

function readJsonFile(file) {
    let bufferData = fs.readFileSync(file)
    let stData = bufferData.toString()
    let data = JSON.parse(stData)
    return data
}