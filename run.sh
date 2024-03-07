git reset --hard
git pull origin main
echo "ready to build!"
npm i

lsof -ti:443 | xargs kill

nohup npm start &
nohup python3 bot.py &

tail -f nohup.out