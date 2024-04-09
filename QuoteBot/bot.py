# This is new in the discord.py 2.0 update
from configparser import ConfigParser
config = ConfigParser()
config.read('config.cfg')
token = config['bot']['token']
guildId = config['bot']['guildId']


# imports
import discord
from discord import app_commands

import requests
import json  
import datetime as dt
import random

import json

last_accessed_date = None
current_string = None

# setting up the bot
intents = discord.Intents.all() 
# if you don't want all intents you can do discord.Intents.default()
client = discord.Client(intents=intents)
tree = discord.app_commands.CommandTree(client)

def daily_quote():
    quote = "no quote available - QuoteBot"

    with open('quotes.json', 'r') as f:
        date = dt.datetime.now().strftime("%d/%m/%Y")
        data = json.load(f)
        print(date);
        print(data);
        if (data["metaData"]["time"] == date):
            quote = data["metaData"]["currentQuote"]["quote"] + "   - " + data["metaData"]["currentQuote"]["auteur"]
        else:
            data["metaData"]["time"] = date
            data["metaData"]["currentQuote"] = data["quotes"][random.randrange(0, len(data["quotes"]), 1)]
            quote = data["metaData"]["currentQuote"]["quote"] + "   - " + data["metaData"]["currentQuote"]["auteur"]
            
    with open('quotes.json', 'w') as f:
        json.dump(data, f)
    
    return quote

# Add the guild ids in which the slash command will appear.
# If it should be in all, remove the argument, but note that
# it will take some time (up to an hour) to register the
# command if it's for all guilds.
@tree.command(
    name="quote",
    description="The daily quote!",
    guild=discord.Object(id=guildId)
)
async def quote(interaction):
    await interaction.response.send_message(daily_quote())
    
@tree.command(
    name="add_quote",
    description="Add a new quote",
    guild=discord.Object(id=guildId)
)
async def addQuote(interaction, quote: str, auteur: str):
    quote_obj = {}
    quote_obj["quote"] = quote
    quote_obj["auteur"] = auteur
    with open('quotes.json', 'r') as f:
        data = json.load(f)
    with open('quotes.json', 'w') as f:
        data["quotes"].append(quote_obj)
        json.dump(data, f)
    
    await interaction.response.send_message("added quote!")
    
@client.event
async def on_ready():
    await tree.sync(guild=discord.Object(id=guildId))
    print("Ready!")

# run the bot
client.run(token)