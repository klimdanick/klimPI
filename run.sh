git reset --hard
git pull origin main
echo "ready to build!"
npm i

lsof -ti:443 | xargs kill
pkill python3

timestamp=$(date +%s)

mv nohup.out '$timestamp.out'

nohup npm start & python3 bot.py &

tail -f nohup.out