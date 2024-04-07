// 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


var express = require('express');
var path = require('path');
var fs = require('fs');

const { spawn } = require('child_process');
const terminate = require('terminate')

const https = require('https');
const app = express();
const options = {
  key: fs.readFileSync('./certs/localhost.decrypted.key'),
  cert: fs.readFileSync('./certs/localhost.crt')
};

const server = https.createServer(options, app);
server.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

app.use(express.static(path.join(__dirname, 'public')));
app.get("/server", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/server.html'));
})
app.get("/start", function (req, res, next) {
	P[0].Run();
	res.send("started");
})
app.get("/getStatus", function (req, res, next) {
	res.send(P[0].Status);
})
app.get("/stop", function (req, res, next) {
	P[0].Stop();
	res.send("stopped");
})
app.get("*", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/404.html'));
})

/*
exec('./acServer', {cwd: "/home/steam/assetto/"}, (error, stdout, stderr) => {
	if (error) {
		console.error(`error: ${error.message}`);
		return;
	}

	if (stderr) {
		console.error(`stderr: ${stderr}`);
		return;
	}

	console.log(`stdout:\n${stdout}`);
});
*/


class Process{
	constructor(Name, Id, Directory, Command) {
		this.Name = Name;
		this.Id = Id;
		this.Directory = Directory;
		this.Command = Command;
		this.out = "";
		P[Id] = this;
	}
	
	Run() {
		this.pros = spawn(this.Command, [], {cwd: this.Directory});
		this.Status = Running;
		this.pros.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
			this.out += data;
		});

		this.pros.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			this.out += "[ERROR]: " + data;
		});

		this.pros.on('close', (code) => {
		  console.log(`child process exited with code ${code}`);
		  this.Status = Stopped;
		}); 
	}
	
	Stop() {
		terminate(this.pros.pid, err => console.log(err));
	}
}

let P = [];
new Process("Assetto", 0, "/home/steam/assetto/", './acServer');
console.log(P);