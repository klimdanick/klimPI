// 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
// nohup node index.js > klimpi.log &


var express = require('express');
var path = require('path');
var fs = require('fs');

const { spawn } = require('child_process');
const terminate = require('terminate')

const https = require('https');
const app = express();
const options = {
  key: fs.readFileSync('/certs/private.key'),
  cert: fs.readFileSync('/certs/certificate.crt')
};

const server = https.createServer(options, app);
server.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

app.use(express.static(path.join(__dirname, 'public')));
app.get("/server", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/server.html'));
})
app.get("/home", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/home.html'));
})
app.get("/start/:Id", function (req, res, next) {
	Run(P[req.params.Id]);
	res.send("started");
})
app.get("/getStatus/:Id", function (req, res, next) {
	res.send(P[req.params.Id].Status);
})
app.get("/stop/:Id", function (req, res, next) {
	Stop(P[req.params.Id]);
	res.send("stopped");
})
/*
app.get("*", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/404.html'));
})
*/


Process = (Name, Id, Directory, Command) => {
	let p = {};
	p.Name = Name;
	p.Id = Id;
	p.Directory = Directory;
	p.Command = Command;
	p.out = "";
	P[Id] = p;
	p.Status = "Stopped";
	return p;
}

ACpros = (process) => {
	ls = spawn("ls", ['content/tracks'], {cwd: process.Directory});
	ls.stdout.on('data', (data) => {
		//console.log(`stdout: ${data}`);
		process.tracks = `${data}`.split("\n");
	});
	return process;
}
	
Run = (process) => {
	console.log(process.Directory);
	process.proc = spawn(process.Command, [], {cwd: process.Directory});
	process.Status = "Running";
	process.proc.stdout.on('data', (data) => {
		//console.log(`stdout: ${data}`);
		process.out += data;
	});

	process.proc.stderr.on('data', (data) => {
		//console.log(`stderr: ${data}`);
		process.out += "[ERROR]: " + data;
	});

	process.proc.on('close', (code) => {
		console.log(`child process exited with code ${code}`);
		process.Status = "Stopped";
	}); 
}
	
Stop = (process) => {
	console.log("STOPPING: " + process.Name);
	terminate(process.proc.pid, err => console.log(err));
}



let P = [];
ACpros(Process("Assetto", 0, "/home/steam/assetto/", './acServer'));
Process("QuoteBot", 1, "../QuoteBot/", './run.sh');
Process("E2 Bot", 2, "~/E2/", './run.sh');
setTimeout(() => {console.log(P);},1000);