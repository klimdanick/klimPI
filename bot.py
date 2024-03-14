# This is new in the discord.py 2.0 update
from configparser import ConfigParser
config = ConfigParser()
config.read('config.cfg')
token = config['bot']['token']


# imports
import discord
from discord import app_commands

import requests
import json  
import datetime as dt
import random

last_accessed_date = None
current_string = None

# setting up the bot
intents = discord.Intents.all() 
# if you don't want all intents you can do discord.Intents.default()
client = discord.Client(intents=intents)
tree = discord.app_commands.CommandTree(client)

def daily_quote():
    global last_accessed_date, current_string
    x = requests.get('https://vps.klimdanick.nl/quote')
    result = json.loads(x.text)
    print(x.text)
    return x.text

# Add the guild ids in which the slash command will appear.
# If it should be in all, remove the argument, but note that
# it will take some time (up to an hour) to register the
# command if it's for all guilds.
@tree.command(
    name="quote",
    description="The daily quote!",
    guild=discord.Object(id=585546274816917552)
)
async def quote(interaction):
    await interaction.response.send_message(daily_quote())
    
@tree.command(
    name="add_quote",
    description="Add a new quote",
    guild=discord.Object(id=585546274816917552)
)
async def addQuote(interaction, quote: str, auteur: str):
    print(quote)
    print(auteur)
    await interaction.response.send_message(daily_quote())
    
@client.event
async def on_ready():
    await tree.sync(guild=discord.Object(id="585546274816917552"))
    print("Ready!")

# run the bot
client.run(token)