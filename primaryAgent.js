// 一级代理
// 支持http/https的所有请求
const net = require('net');
const local_port = process.argv[2] || 7777;
var log = console.log.bind(console);
net.createServer(c => {
    c.on('data', chunk => {
        var headers = chunk.toString();
        // log(chunk[0]==Buffer.from('CONNECT')[0],0X43,67);
        if (headers.includes('\r\n\r\n')) {
            c.removeAllListeners('data');

            var [method, hostname, port] = parseHeaders(headers);
            var s = net.createConnection(port, hostname, () => {
                method == 'CONNECT' ?
                    c.write(Buffer.from('HTTP/1.1 200 Connection established\r\nConnection: close\r\n\r\n')) :
                    s.write(chunk);
                c.on('data', d => {
                    // log('c data:', d.toString());
                    s.write(d);
                });
                s.on('data', d => {
                    // c(server)的end事件之后不再发送信息
                    if (!c.destroyed) {
                        // http返回明文
                        // https返回的是Encrypt之后的
                        c.write(d);
                        if (method != 'CONNECT')
                            log('s data:', d.toString());
                    }
                });
                s.on('error', e => {
                    log('s err:', e.stack);
                });
            });

        }

    });
    c.on('error', e => {
        log('c err:', e.stack);
        // This socket has been ended by the other party
    });
}).listen(local_port, () => {
    log('start local proxy server at:', local_port);
});

function parseHeaders(headers) {
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
    var headerList = headers.split('\r\n');
    var method = headerList[0].split(' ')[0];
    var headerLine;
    if (method === 'CONNECT') {
        // 'CONNECT 127.0.0.1:8001 HTTP/1.1',
        // 'Host: 127.0.0.1:8001', 
        // Host里 不一定带有端口; 但是第一行一定有端口号
        headerLine = headerList[0].split(' ')[1]; //127.0.0.1:8001
    } else {
        // 'GET http://127.0.0.1:8000/a.html?a=http HTTP/1.1',
        // 'Host: 127.0.0.1:8000',
        headerLine = headerList[1].split(' ')[1]; //127.0.0.1:8000
    }
    var host = headerLine.split(':');
    var hostname = host[0];
    log(headerLine);
    var port = host[1] || (method === 'CONNECT' ? 443 : 80);
    // 或者只解析第一行,通过url.parse()获取hostname,port;
    return [method, hostname, port];
}
