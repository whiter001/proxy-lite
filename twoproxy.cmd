:: http req
REM curl -x 127.0.0.1:8888 -v -H "User-Agent:Chrome/54.0 (Windows NT 10.0)" http://httpbin.org/get?req=http
:: https req
curl -x 127.0.0.1:8888 -v -H "User-Agent:Chrome/54.0 (Windows NT 10.0)" https://httpbin.org/get?req=https -k

:: https post req
curl -x 127.0.0.1:8888 https://httpbin.org/post -d a=1 -d b=2 -k -X POST
:: or
curl -x 127.0.0.1:8888 https://httpbin.org/post -d "a=1&b=2" -k

:: doskey f=secondaryAgent.cmd
