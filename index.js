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
	writeJsonFile("quotes.json", {"quotes": quotes});
	res.send("");
}) 

app.get('/quote', (req, res) => {
	res.send(quotes);
});

app.get('/quoteBoek', (req, res) => {
	res.sendFile(path.join(__dirname, '/index.html'));
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

import { REST, Routes } from 'discord.js';

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.login(process.env.TOKEN);

/*

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'test') {
        interaction.reply('Test successful!');
    }
});

client.login(process.env.TOKEN)*/