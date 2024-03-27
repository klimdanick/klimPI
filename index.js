const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const app = express()
require("dotenv").config()
const port = process.env.PORT
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
var https = require('https');
var fs = require('fs');
var quotes = readJsonFile("quotes.json")["quotes"];
var metadata = readJsonFile("quotes.json")["metadata"];
const path = require('path');

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
	writeJsonFile("quotes.json", {"quotes": quotes, "metadata": metadata});
	res.send("done!");
}) 

app.get('/quote', (req, res) => {
	const dateString = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' }).slice(0, 10);
//	let dateString = date.toISOString().slice(0,10);
	console.log(dateString);
	if (metadata["dateString"] != dateString) {
		metadata["dateString"] = dateString;
		let currentQuote;
		do {
			currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
		} while(currentQuote == metadata["currentQuote"]);
		metadata["currentQuote"] = currentQuote;
		writeJsonFile("quotes.json", {"quotes": quotes, "metadata": metadata});
	}
	res.send(metadata["currentQuote"]);
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


const { exec } = require("child_process");
exec("python3 bot.py", (error, data, getter) => {
	if(error){
		console.log("error",error.message);
		return;
	}
	if(getter){
		console.log("data",data);
		return;
	}
	console.log("data",data);

});
