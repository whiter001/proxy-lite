# npm i -g anywhere
# http://193.158.168.135:8000/a.html
# https://193.158.168.135:8001/a.html
curl -x localhost:7777 http://127.0.0.1:8000/a.html?a=http
curl -x localhost:7777 https://127.0.0.1:8001/a.html?a=https -k
# alias f=./firstproxy.sh

# anywhere
# cla && node prrimaryAgent.js
# f
