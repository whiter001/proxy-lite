// 二级代理
// 支持http和https的所有请求
var net = require('net');
var local_host = '127.0.0.1';
var local_port = 8888;
const proxyPort = 7777;
const proxyHost = '127.0.0.1';
var srv = net.createServer(c => {
    c.on('data', chunk => { // on 是addListener的别称
        var headers = chunk.toString();
        if (headers.includes('\r\n\r\n')) {
            console.log(headers);
            c.removeAllListeners('data');

            console.log('client connected');
            var s = net.connect(proxyPort, proxyHost); // connect 是createConnection的别称
            s.write(chunk);
            // 利用管道
            s.pipe(c);
            c.pipe(s);
            /* 
             //通过监听事件的方式
             c.on('data', d => {
                // console.log('c2 data:', d.toString());
                s.write(d);
            });
            s.on('data', d => {
                console.log('socket destroyed: ', c.destroyed);
                // console.log('s data:', d.toString());
                if (!c.destroyed) {
                    c.write(d);
                }
            }); */
            s.on('error', e => {
                console.log('s err:', e.stack);
            })
            s.on('end', () => {
                console.log('socket disconnected');
                //srv.close(); //最后关闭本地代理
            })
        }

    });
    c.on('end', () => {
        console.log('client disconnected');
    })
    c.on('error', e => {
        console.log('client err:', e.stack)
    })
});
srv.on('error', e => {
    console.log('srv err:', e.stack)
})
srv.listen(local_port);
/* 
$ curl -x 127.0.0.1:8888 https://httpbin.org/get -k -v
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 8888 (#0)
* allocate connect buffer!
* Establish HTTP proxy tunnel to httpbin.org:443
> CONNECT httpbin.org:443 HTTP/1.1
> Host: httpbin.org:443
> User-Agent: curl/7.56.1
> Proxy-Connection: Keep-Alive
>
< HTTP/1.0 200 Connection Established
< Proxy-agent: IBM_HTTP_Server
<
* Proxy replied 200 to CONNECT request
* CONNECT phase completed!
* ALPN, offering h2
* ALPN, offering http/1.1
* Cipher selection: ALL:!EXPORT:!EXPORT40:!EXPORT56:!aNULL:!LOW:!RC4:@STRENGTH
* successfully set certificate verify locations:
*   CAfile: C:/Program Files/Git/mingw32/ssl/certs/ca-bundle.crt
  CApath: none
* TLSv1.2 (OUT), TLS header, Certificate Status (22):
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
* CONNECT phase completed!
* CONNECT phase completed!
* TLSv1.2 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
* TLSv1.2 (IN), TLS handshake, Server finished (14):
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
* TLSv1.2 (OUT), TLS change cipher, Client hello (1):
* TLSv1.2 (OUT), TLS handshake, Finished (20):
* TLSv1.2 (IN), TLS change cipher, Client hello (1):
* TLSv1.2 (IN), TLS handshake, Finished (20):
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256
* ALPN, server accepted to use http/1.1
* Server certificate:
*  subject: CN=httpbin.org
*  start date: Jan  8 23:16:03 2019 GMT
*  expire date: Apr  8 23:16:03 2019 GMT
*  issuer: C=US; O=Let's Encrypt; CN=Let's Encrypt Authority X3
*  SSL certificate verify ok.
> GET /get HTTP/1.1
> Host: httpbin.org
> User-Agent: curl/7.56.1
> Accept: * /*
>
< HTTP/1.1 200 OK
< Connection: keep-alive
< Server: gunicorn/19.9.0
< Date: Thu, 17 Jan 2019 02:12:49 GMT
< Content-Type: application/json
< Content-Length: 216
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Credentials: true
< Via: 1.1 vegur
<
{
  "args": {},
  "headers": {
    "Accept": "* / *",
    "Connection": "close",
    "Host": "httpbin.org",
    "User-Agent": "curl/7.56.1"
  },
  "origin": "211.146.16.132",
  "url": "https://httpbin.org/get"
}
* Connection #0 to host 127.0.0.1 left intact

s data
c data
s data
s data
c data
s data
c data
s data
c data
c end
s end
* https
* srv:create server 127.0.0.1:8888 -> c:data (srv:headers) 
> CONNECT httpbin.org:443 HTTP/1.1
> Host: httpbin.org:443
> User-Agent: curl/7.56.1
> Proxy-Connection: Keep-Alive
>

* -> s:connect proxy -> s:send (srv:headers)[to endpoint]

* -> s: data(endpoint body) -> c: send(endpoint body)[to srv]
* -> c:data (body) -> s:send body [to endpoint] -> s:data (endpoint body) -> c:send (endpoint body)[to srv]
... 各种频繁的交换数据:
client:加密请求(tls版本,协商密匙,加密算法,压缩方法)
server:加密响应:确认加密通信规则,并返回服务端证书
client:证书校验、生成密码、公钥加密; 加密信息C-S
server: 私钥解密、解密握手消息、验证Hash;加密信息S-C(编码改变通知,服务端握手结束)
client:解密握手消息、验证Hash,如果与服务端发来的Hash一致,握手结束
正常加密通信

 -> c:close -> s:close -> srv:close


$ curl -x 127.0.0.1:8888 http://baidu.com -v
* Rebuilt URL to: http://baidu.com/
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 8888 (#0)
> GET http://baidu.com/ HTTP/1.1
> Host: baidu.com
> User-Agent: curl/7.56.1
> Accept: * / *
> Proxy-Connection: Keep-Alive
>
< HTTP/1.1 200 OK
< Date: Thu, 17 Jan 2019 02:35:47 GMT
< Server: Apache
< Last-Modified: Tue, 12 Jan 2010 13:48:00 GMT
< ETag: "51-47cf7e6ee8400"
< Accept-Ranges: bytes
< Content-Length: 81
< Cache-Control: max-age=86400
< Expires: Fri, 18 Jan 2019 02:35:47 GMT
< Content-Type: text/html
< Via: 1.1 linux-zhcs:8081
<
<html>
<meta http-equiv="refresh" content="0;url=http://www.baidu.com/">
</html>
* Connection #0 to host 127.0.0.1 left intact
* http
srv:create server 127.0.0.1:8888 -> c:data (srv:headers) ->
s:connect proxy -> s:send (srv:headers)[to endpoint] ->
s: data(endpoint body) -> c:send(endpoint body) [to srv] ->
c:close -> s:close -> srv:close
s data
c end
s end
*/

httpreq();
httpsreq();

function httpreq() {
    var http = require('http');
    var opt = {
        host: local_host,
        port: local_port,
        method: 'get',
        path: 'http://httpbin.org/get?a=1'
    };
    http.request(opt, res => {
        res.on('data', d => {
            console.log('client request:', d.toString());
        })
    }).end()
}

function httpsreq() {
    var log = console.log.bind(console);
    var net = require('net');
    var local_host = '127.0.0.1';
    var local_port = 8888;
    const proxyPort = 7777;
    const proxyHost = '192.156.33.154';
    var http = require('http');
    const tls = require('tls');
    const url = require('url');

    // 自定义地址
    // const href = "https://www.baidu.com";
    const href = "https://httpbin.org/post?a=3";
    // const href = "https://hq.sinajs.cn/list=sh601006";
    // href = 'https://api.github.com/user';



    var nurl = url.parse(href);
    var path = nurl.hostname + (nurl.protocol == "https:" ? ":443" : ":80");
    log(path, nurl);
    var req = http.request({
        hostname: local_host,
        port: local_port,
        method: 'CONNECT',
        path: path
    });

    req.end();
    req.on('connect', function(res, socket, head) {
        var s = tls.connect({
            socket: socket,
            servername: nurl.hostname
        }, () => {
            var postData = require('querystring').stringify({
                a: 'a'
            });
            var cl = postData.length;
            head += `POST ${nurl.path} HTTP/1.1\r\nHost:${nurl.host}\r\nContent-Type:application/multipart/x-www-form-urlencoded\r\nContent-Length: ${cl}\r\nConnection:Close\r\n\r\n`;
            s.write(head);
            s.write(postData);
        })
        s.on('data', d => {
            console.log('https resp:', d.toString());
        })
        s.on('error', function(e) {
            console.log("tls error:", e.message);
        })

    });

    req.on('error', (e) => {
        console.log(`request error: ${e.message}`);
    });
}