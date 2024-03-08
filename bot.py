from configparser import ConfigParser
config = ConfigParser()
config.read('config.cfg')
token = config['bot']['token']
import discord
from discord.ext import commands
import datetime as dt
import random

last_accessed_date = None
current_string = None
bot = commands.Bot(command_prefix='$', intents=discord.Intents.all())
bot.intents.message_content = True


@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f'Logged on as {bot.user}!')

@bot.event
async def on_message(message: discord.message.Message):
    if message.content.startswith("/") and not message.author == bot.user:
        await message.channel.send(daily_quote())
          

def daily_quote():
    global last_accessed_date, current_string

    # vervang door json shit
    quote_list = ["Soep is vlees thee", "Hoort zeeland bij nederland?", "Mag je neet?", "Een zomer maakt nog geen zwaluw"]
    current_date = dt.datetime.now().date()

    if last_accessed_date is None or last_accessed_date < current_date:
        current_string = random.choice(quote_list)
        last_accessed_date = current_date
    
    return current_string

print(f'Starting bot!')
bot.run(token)