from configparser import ConfigParser
config = ConfigParser()
config.read('config.cfg')
token = config['bot']['token']
import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.messages = True

bot = commands.Bot(command_prefix='$', intents=intents)

@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f'We have logged in as {bot.user}')
    


@bot.event
async def on_message(message):
    if message.author == bot.user:
        return

    if message.content.startswith('$hello'):
        await message.channel.send('Hello!')

@bot.tree.command(name="test",description="test")
async def slash_command(interaction:discord.Interaction):
    await interaction.response.send_message("Hello World!")

bot.run(token)