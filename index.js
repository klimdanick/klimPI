var express = require('express');
var path = require('path');
var fs = require('fs');

const { exec } = require('child_process');

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
app.get("*", function (req, res, next) {
	res.sendFile(path.join(__dirname + '/public/404.html'));
})

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