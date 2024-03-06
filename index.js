const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const app = express()
const port = 443
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;

app.post('/quote', jsonParser, (req, res) => {
	console.log(req.body);
	res.send("");
}) 

app.get('/quote', (req, res) => {
	res.send("quote");
});

app.get('/quoteBoek', (req, res) => {
	res.send("<h1>quoteboek</h1>");
});

var https = require('https');
var fs = require('fs');

var https_options = {
	key: fs.readFileSync("/certs/private.key"),
	cert: fs.readFileSync("/certs/certificate.crt"),
	ca: [fs.readFileSync('/certs/ca_bundle.crt')] 
};

https.createServer(https_options, app).listen(port)

console.log("KlimPI is online!");