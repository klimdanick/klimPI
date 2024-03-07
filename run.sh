git reset --hard
git pull origin main
echo "ready to build!"
npm i
npm start &
python3 bot.py &