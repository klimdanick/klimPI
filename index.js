var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('certificates/key.pem', 'utf8');
var certificate = fs.readFileSync('certificates/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();
const port = 8080;

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`KlimPI is online! \n at http://localhost:${port}`))