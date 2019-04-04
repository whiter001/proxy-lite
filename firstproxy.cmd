:: http req
curl -x 127.0.0.1:7777 -v -H "User-Agent:Chrome/54.0 (Windows NT 10.0)" http://httpbin.org/get?req=http
:: https req
curl -x 127.0.0.1:7777 -v -H "User-Agent:Chrome/54.0 (Windows NT 10.0)" https://httpbin.org/get?req=https -k

:: doskey f=firstproxy.cmd