// 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
// nohup node index.js > klimpi.log &


var express = require('express');
var path = require('path');
var fs = require('fs');

const { spawn } = require('child_process');
const terminate = require('terminate')

const https = require('https');
const { kill } = require('process');
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
app.get("/getACdata/:Id", function (req, res, next) {
	AC = P[req.params.Id];
	res.json({
		tracks: AC.tracks,
		cars: AC.cars
	})
})


Process = (Name, Id, Directory, Command, autoRun = true, killcommand = {"command": "term", "args": []}) => {
	let p = {};
	p.Name = Name;
	p.Id = Id;
	p.Directory = Directory;
	p.Command = Command;
	p.out = "";
	P.killcommand = killcommand;
	P[Id] = p;
	p.Status = "Stopped";
	if (autoRun) Run(p);
	return p;
}

ACpros = (process) => {
	lsTrakcs = spawn("ls", ['content/tracks'], {cwd: process.Directory});
	lsTrakcs.stdout.on('data', (data) => {
		process.tracks = `${data}`.split("\n");
	});

	lsCars = spawn("ls", ['content/cars'], {cwd: process.Directory});
	lsCars.stdout.on('data', (data) => {
		process.cars = `${data}`.split("\n");
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
	if (process.killcommand.command != "term") {
		killproc = spawn(process.killcommand.command, process.killcommand.args, {cwd: process.Directory});
		killproc.stdout.on('data', (data) => {
			//console.log(`stdout: ${data}`);
			console.log(`kill command: ${data}`);
		});
	}
	terminate(process.proc.pid, err => console.log(err));
}



let P = [];
Process("Assetto", 0, "../acServerManager", './server-manager');
Process("QuoteBot", 1, "../QuoteBot/", './run.sh');
Process("E2 Bot", 2, "../E2/", './run.sh');
Process("x screen", 3, "../torcs/torcs-1.3.7", "./xserver.sh");
Process("xterm", 4, "../torcs/torcs-1.3.7", "xterm", true, {"command": "killall", "args": ["xterm"]});
setTimeout(() => {console.log(P);},1000);
