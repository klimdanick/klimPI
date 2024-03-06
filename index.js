const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const app = express()
const port = 443
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;

app.post('/post', jsonParser, (req, res) => {
	console.log(req.body);
}) 

app.get('/', (req, res) => {
	res.send("Hello World!");
});

var https = require('https');
var fs = require('fs');

var https_options = {
	key: fs.readFileSync("/certs/private.key"),
	cert: fs.readFileSync("/certs/certificate.crt"),
	ca: [fs.readFileSync('/certs/ca_bundle.crt')] 
};

https.createServer(https_options, app).listen(port)