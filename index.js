// nohup node index.js > klimpi.log &


var express = require('express');
var path = require('path');
var fs = require('fs');
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

const { spawn } = require('child_process');
const terminate = require('terminate')

const https = require('https');
const { kill } = require('process');
let pidusage = require('pidusage');
const app = express();
let options;
try {
	options = {
		key: fs.readFileSync('/certs/private.key'),
		cert: fs.readFileSync('/certs/certificate.crt')
	};
} catch(err) {
	options = {
		key: fs.readFileSync('certs/private.key'),
		cert: fs.readFileSync('certs/certificate.crt')
	};
}

const crypto = require('crypto')

const server = https.createServer(options, app);
server.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, "/root/files/"+req.cookies.username+"/");
	},
	filename: function (req, file, cb) {
	  cb(null, file.originalname); // Adds a unique timestamp to avoid file overwriting
	}
  });

const upload = multer({ storage: storage });

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
	  "Access-Control-Allow-Headers",
	  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	if (req.method === "OPTIONS") {
	  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
	  return res.status(200).json({});
	}
	next();
  });
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.raw({inflate:true, limit: '100kb', type: 'application/json'}));
app.use(bodyParser.raw({inflate:true, limit: '1mb', type: 'text/plain'}))
app.use(cookieParser())
app.use((req, res, next) => {
	//console.log(req.url);
	//console.log(req.body);
	let username = req.body.username;
	let password = req.body.password;
	let token = req.cookies.token;
	if (username && password) {
		if (username == "fred" && password == "neusgat") {
			token = "21232f297a57a5a743894a0e4a801fc3"
			res.cookie('token', token, { maxAge: 900000000, httpOnly: false })
			res.cookie('username', username, { maxAge: 900000000, httpOnly: false })
			return next();
		}
	}
	if (token && token == "21232f297a57a5a743894a0e4a801fc3") {
		return next();
	} else {
		if (req.url == "/login") return next();
		if (req.url == "/icon.png") return next();
		if (req.url.startsWith("/download/")) return next();
		return res.status(401).redirect("/login")
	}
})
app.get("/", function (req, res, next) {
	if(req.hostname == "vps.klimdanick.nl") res.status(301).redirect("https://vps.klimdanick.nl/server")
	if(req.hostname == "file.klimdanick.nl") res.sendFile(path.join(__dirname + '/public/file/index.html'));
})
app.use(express.static(path.join(__dirname, 'public')));
app.get("/login", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/login.html'));
})
app.post("/login", function (req, res, next) {
	res.status(200).redirect("https://vps.klimdanick.nl/server")
})
app.get("/dashboard", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/dashboard.html'));
})
app.get("/server", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/server.html'));
})
app.get("/home", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/home.html'));
})
app.get("/taart", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/taart.html'));
})
app.get("/start/:Id", function (req, res, next) {
	Run(P[req.params.Id]);
	res.send("started");
})
app.get("/getStatus/:Id", function (req, res, next) {
	res.send(P[req.params.Id].Status);
})
app.get("/getStats/:Id", function (req, res, next) {
	res.json(P[req.params.Id].stats);
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
app.get("/resetMcWorld/:Id", function (req, res, next) {
	MC = P[req.params.Id];
	//Stop(MC);
	console.log(MC.Directory + "$ reset.sh");

	ls = spawn("./reset.sh", [], {cwd: MC.Directory});
	ls.stdout.on('data', (data) => {
		console.log(data);
	}); 

	//Run(MC);
	res.status(200);
})

app.get("/ELEGEN/title/:domain", function (req, res, next) {
	let ELEGEN = JSON.parse(fs.readFileSync("ELEGEN.json").toString())
	if (ELEGEN[req.params.domain]) res.send(ELEGEN[req.params.domain]["title"])
	else res.send(ELEGEN["localhost"]["title"])
})
app.get("/ELEGEN/text/:domain", function (req, res, next) {
	let ELEGEN = JSON.parse(fs.readFileSync("ELEGEN.json").toString())
	if (ELEGEN[req.params.domain]) res.send(ELEGEN[req.params.domain]["text"])
	else res.send(ELEGEN["localhost"]["text"])
})

app.post("/ELEGEN/title/:domain", function (req, res, next) {
	let ELEGEN = JSON.parse(fs.readFileSync("ELEGEN.json").toString())
	if (!ELEGEN[req.params.domain]) {
		res.sendStatus(400);
		return;
	}
	ELEGEN[req.params.domain].title = JSON.parse(req.body);
	let data = JSON.stringify(ELEGEN);
	fs.writeFile('ELEGEN.json', data, (err) => {
		if (err) throw err;
		console.log(`Data written to file ${data}`);
	});
	res.sendStatus(200);
})
app.post("/ELEGEN/text/:domain", function (req, res, next) {
	let ELEGEN = JSON.parse(fs.readFileSync("ELEGEN.json").toString())
	if (!ELEGEN[req.params.domain]) {
		res.sendStatus(400);
		return;
	}
	ELEGEN[req.params.domain].text = JSON.parse(req.body);
	//console.log(ELEGEN);
	let data = JSON.stringify(ELEGEN);
	fs.writeFile('ELEGEN.json', data, (err) => {
		if (err) throw err;
		console.log(`Data written to file ${data}`);
	});
	res.sendStatus(200);
})

app.get("/download/:fileID", function (req, res, next) {
	let id = req.params.fileID;
	let file = JSON.parse(fs.readFileSync("../files/db.json").toString())["files"][id]
	if (file) {
		console.log(path.join(`/root/files/${file.user}/${file.name}`));
		res.sendFile(path.join(`/root/files/${file.user}/${file.name}`));
	} else
		res.send("file not found!");
})

app.post("/upload", upload.single('file'), function (req, res, next) {
	let filename = req.file.filename;
	let user = req.cookies.username;
	let datetime = new Date().toISOString();
	let hash = filename;//crypto.createHash('md5').update(filename+user+datetime).digest("hex")

	checkFile("/root/files/db.json");
	let db = JSON.parse(fs.readFileSync("/root/files/db.json").toString())
	db["files"][hash] = {"name": filename, user, datetime, hash}
	fs.writeFile("/root/files/db.json", JSON.stringify(db), (err) => {if (err) throw err;});

	res.status(200).redirect("https://vps.klimdanick.nl/myFiles");
})

app.get("/myFiles", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/file/myFiles.html'));
})

app.get("/fileList", function (req, res, next) {
	checkFile("/root/files/db.json");
	let db = JSON.parse(fs.readFileSync("../files/db.json").toString())
	res.send(db.files);
})

function checkFile(path) {
	const fs = require("fs"); // Or `import fs from "fs";` with ESM
	if (!fs.existsSync(path)) {
		let json = {"files": {}};
		fs.open(path, 'w', function (err, file) {});
		fs.writeFileSync(path, JSON.stringify(json));
	}
}

Process = (Name, Id, Directory, Command = {"command": "./run.sh", "args": []}, autoRun = false, killcommand = {"command": "term", "args": []}) => {
	let p = {};
	p.Name = Name;
	p.Id = Id;
	p.Directory = Directory;
	p.Command = Command;
	p.out = "";
	p.killcommand = killcommand;
	P[Id] = p;
	p.Status = "Stopped";
	if (autoRun) Run(p);
	p.stats = {cpu: [], ram: [], up: [], down: []};
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
	process.proc = spawn(process.Command.command, process.Command.args, {cwd: process.Directory});
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
	console.log(`STOPPING: ${process} with: ${process.killcommand}`);
	if (process.killcommand && process.killcommand["command"] != "term") {
		killproc = spawn(process.killcommand["command"], process.killcommand.args, {cwd: process.Directory});
		killproc.stdout.on('data', (data) => {
			//console.log(`stdout: ${data}`);
			console.log(`kill command: ${data}`);
		});
	}
	terminate(process.proc.pid, err => console.log(err));
	process.proc = null;
}

let statsInterval = setInterval(() => {
	for (let i = 0; i < P.length; i++) {
		if (P[i].proc)
		pidusage(P[i].proc.pid, function (err, stats) {
			if (!stats) return;
			P[i].stats.cpu.push({x: new Date(), y: parseFloat(stats.cpu)});
			P[i].stats.ram.push({x: new Date(), y: parseFloat(stats.memory/160000000)});
			//P[i].stats.up.push({x: new Date(), y: parseFloat(0)});
			//P[i].stats.down.push({x: new Date(), y: parseFloat(0)});
		});
		else {
			P[i].stats.cpu.push({x: new Date(), y: parseFloat(0.0)});
			P[i].stats.ram.push({x: new Date(), y: parseFloat(0.0)});
			//P[i].stats.up.push({x: new Date(), y: parseFloat(0.0)});
			//P[i].stats.down.push({x: new Date(), y: parseFloat(0.0)});
		}
		while (P[i].stats.cpu.length > 60) P[i].stats.cpu.shift();
		while (P[i].stats.ram.length > 60) P[i].stats.ram.shift();
		while (P[i].stats.up.length > 60) P[i].stats.up.shift();
		while (P[i].stats.down.length > 60) P[i].stats.down.shift();
	}
}, 1000);


let P = [];
Process("Assetto", 0, "../acServerManager", {command: './server-manager', args: []});
Process("QuoteBot", 1, "../QuoteBot/");
Process("E2 Bot", 2, "../E2/");
Process("x screen", 3, "../torcs/torcs-1.3.7", {command: "./xserver.sh", args: []}, false, {command: "killall", args: ["Xvfb"]});
Process("xterm", 4, "../", {command: "xterm", args: ["-display", ":1", "-hold"]}, false, {command: "killall", args: ["xterm"]});
Process("torcs server", 5, "../torcs/torcs-1.3.7/BUILD/bin", {command: "xterm", args: ["-display", ":1", "-hold", "-e", "./torcs"]}, false);
Process("King Of The North Server", 6, "../KotN/", {command: "java", args: ["-jar", "KotN_Server.jar"]}, false);
Process("MC hardcore", 7, "../mcServer/", {command: "java", args: ["-Xms8G", "-Xmx8G", "-jar", "paper-1.20.1-45.jar", "--nogui"]}, false)
setTimeout(() => {console.log(P);},1000);
