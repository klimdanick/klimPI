lsof -ti:443 | xargs kill
pkill python3

echo "stopped shit"