const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const app = express()
const port = 443
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
let mcStatus = false;
let mcProc;
let mcConsole = "";
const process = require('process');
let gameStatus = false;
let gameProc;
let gameConsole = "";
let botStatus = false;
let botProc;
let botConsole = "";


app.post('/inputMC', jsonParser, (req, res) => {
	console.log(req.body);
	mcProc.stdin.cork();
	mcProc.stdin.write(req.body.data);
	process.nextTick(() => mcProc.stdin.uncork());
}) 

app.get('/statsMC', (req, res) => {

	if (mcStatus)
		exec("top -b -n 2 -d 0.2 -p "+(mcProc.pid+1)+" | tail -1 | awk '{print $9,$10}'", (error, stdout, stderr) => {
			let data = {"cpu": parseFloat(stdout.split(" ")[0]), "ram": parseFloat(stdout.split(" ")[1])};
			res.json(data);
		})
	else
		res.json({"process": "not running"});
});

app.get('/statsGame', (req, res) => {
	if (gameStatus)
		exec("top -b -n 2 -d 0.2 -p "+(gameProc.pid+1)+" | tail -1 | awk '{print $9,$10}'", (error, stdout, stderr) => {
			let data = {"cpu": parseFloat(stdout.split(" ")[0]), "ram": parseFloat(stdout.split(" ")[1])};
			res.json(data);
		})
	else
		res.json({"process": "not running"});
});

app.get('/statsBot', (req, res) => {
	if (botStatus)
		exec("top -b -n 2 -d 0.2 -p "+(botProc.pid+1)+" | tail -1 | awk '{print $9,$10}'", (error, stdout, stderr) => {
			let data = {"cpu": parseFloat(stdout.split(" ")[0]), "ram": parseFloat(stdout.split(" ")[1])};
			res.json(data);
		})
	else
		res.json({"process": "not running"});
});

app.get('/', (req, res) => {
	res.sendFile('/public/interface.html', {root: __dirname });
});

app.get('/dataMC', (req, res) => {
	if (mcStatus) {
		//console.log(mcConsole);
		res.send(mcConsole.replace("\n", "<br>"));
		mcConsole = "";
		//exec('ps -u -p' + mcProc.pid, (error, stdout, stderr) => {let data = stdout.replace("\n", "<br>"); res.send(data); /*console.log(data)*/});
	} else
		res.send("");
	
});

app.get('/dataGame', (req, res) => {
	if (gameStatus) {
		//console.log(mcConsole);
		res.send(gameConsole.replace("\n", "<br>"));
		gameConsole = "";
		//exec('ps -u -p' + mcProc.pid, (error, stdout, stderr) => {let data = stdout.replace("\n", "<br>"); res.send(data); /*console.log(data)*/});
	} else
		res.send("");
	
});

app.get('/botGame', (req, res) => {
	if (botStatus) {
		//console.log(mcConsole);
		res.send(botConsole.replace("\n", "<br>"));
		botConsole = "";
		//exec('ps -u -p' + mcProc.pid, (error, stdout, stderr) => {let data = stdout.replace("\n", "<br>"); res.send(data); /*console.log(data)*/});
	} else
		res.send("");
	
});

app.get('/data', (req, res) => {
	exec('free -h', (error, stdout, stderr) => {let data = stdout.replace("\n", "<br>"); res.send(data); /*console.log(data)*/});
	// free -h
});

app.get('/runMC', (req, res) => {
	if (mcStatus) res.send("already running!");
	else {
		mcStatus = true;
		//res.send("starting");
		try {
		  process.chdir('/root/moddedServer/server');
		  console.log("directory has successfully been changed");
		  mcProc = exec('java @user_jvm_args.txt @libraries/net/minecraftforge/forge/1.19.2-43.2.21/unix_args.txt "$@"', (error, stdout, stderr) => {res.send(stdout)})
		  mcConsole += "\nstarted minecraft server!\n"
		  console.log(mcProc.pid+1);
		  mcProc.stdout.setEncoding('utf8');
		  mcProc.stdout.on('data', function(data) {
			//Here is where the output goes

			//console.log('stdout: ' + data);

			data=data.toString();
			mcConsole+=data;
		  });
		} catch (err) {
		  console.error("error while changing directory");
		  console.log(err);
		}
	}
})

app.get('/runGame', (req, res) => {
	if (gameStatus) res.send("already running!");
	else {
		gameStatus = true;
		//res.send("starting");
		try {
		  process.chdir('/root/javaServer');
		  console.log("directory has successfully been changed");
		  gameProc = exec('java -jar server.jar', (error, stdout, stderr) => {res.send(stdout)})
		  gameConsole += "\nstarted game server!\n";
		  console.log(gameProc.pid+1);
		  gameProc.stdout.setEncoding('utf8');
		  gameProc.stdout.on('data', function(data) {
			//Here is where the output goes

			console.log('stdout: ' + data);

			data=data.toString();
			gameConsole+=data;
		  });
		} catch (err) {
		  console.error("error while changing directory");
		  console.log(err);
		}
	}
})

app.get('/runBot', (req, res) => {
	if (botStatus) res.send("already running!");
	else {
		botStatus = true;
		//res.send("starting");
		try {
		  process.chdir('/root/E2');
		  console.log("directory has successfully been changed");
		  botProc = exec('java -jar E2Bot.jar', (error, stdout, stderr) => {res.send(stdout)})
		  botConsole += "\nstarted game server!\n";
		  console.log(botProc.pid+1);
		  botProc.stdout.setEncoding('utf8');
		  botProc.stdout.on('data', function(data) {
			//Here is where the output goes

			console.log('stdout: ' + data);

			data=data.toString();
			botConsole+=data;
		  });
		} catch (err) {
		  console.error("error while changing directory");
		  console.log(err);
		}
	}
})

app.get('/stopMC', (req, res) => {
	if (!mcStatus) res.send("already stopped!");
	else {
		mcStatus = false;
		mcConsole = "";
		exec('kill '+(mcProc.pid+1), (error, stdout, stderr) => {console.log(stdout); res.send(stdout)});
	}
})

app.get('/stopGame', (req, res) => {
	if (!gameStatus) res.send("already stopped!");
	else {
		gameStatus = false;
		gameConsole = "";
		exec('kill '+(gameProc.pid+1), (error, stdout, stderr) => {console.log(stdout); res.send(stdout)});
	}
})

app.get('/stopBot', (req, res) => {
	if (!botStatus) res.send("already stopped!");
	else {
		botStatus = false;
		botConsole = "";
		exec('kill '+(botProc.pid+1), (error, stdout, stderr) => {console.log(stdout); res.send(stdout)});
	}
})

var https = require('https');
var fs = require('fs');

var https_options = {
key: fs.readFileSync("/certs/private.key"),
cert: fs.readFileSync("/certs/certificate.crt"),
ca: [
//fs.readFileSync('certs/CA_root.crt'),
fs.readFileSync('/certs/ca_bundle.crt')
] };
https.createServer(https_options, app).listen(port)
//app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
//java @user_jvm_args.txt @libraries/net/minecraftforge/forge/1.19.2-43.2.21/unix_args.txt "$@"
