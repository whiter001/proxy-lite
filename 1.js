// 一级代理
// 支持http/https的所有请求
const net = require('net');
const url = require('url');
const log = console.log.bind(console);
const local_port = process.argv[2] || 7777;
log('default proxy port:7777, can change with first argv');
net.createServer(c => {
    c.once('data', buf => {
        var [isHttps, hostname, port] = parseHeaders(buf);
        var s = net.connect(port, hostname, () => {
            isHttps ?
                c.write(Buffer.from('HTTP/1.1 200 Connection established\r\nConnection: close\r\n\r\n')) :
                s.write(buf);
            c.pipe(s).pipe(c);
        });
        s.on('error', e => {
            log('s err:', e.message);
        });

    });
    c.on('error', e => {
        log('c err:', e.message);
    });
}).listen(local_port, () => {
    log('start local proxy server at:', local_port);
});

function parseHeaders(headers) {
    // var isHttps = headers[0] == Buffer.from('CONNECT')[0];
    var isHttps = headers[0] == 67,
        path = headers.toString().split(' ', 2)[1];
    path = isHttps ? 'https://' + path : path;
    path = url.parse(path);
    var hostname = path.hostname;
    var port = path.port || (isHttps ? 443 : 80);
    /*
      [ 'GET http://127.0.0.1:8000/a.html?a=http HTTP/1.1',
      'Host: 127.0.0.1:8000',
      'User-Agent: curl/7.56.1',
      'Accept: text/plain',
      'Proxy-Connection: Keep-Alive',
      '',
      '' ]
      [ 'CONNECT 127.0.0.1:8001 HTTP/1.1',
      'Host: 127.0.0.1:8001',
      'User-Agent: curl/7.56.1',
      'Proxy-Connection: Keep-Alive',
      '',
      '' ]
      */
    return [isHttps, hostname, port];
}