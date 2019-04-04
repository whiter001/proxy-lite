var net = require('net');
var proxyHost = '192.156.33.154'; // 上级代理地址
var proxyPort = 7777;
net.createServer(c => {
    c.once('data', buf => {
        var s = net.connect(proxyPort, proxyHost, () => {
            s.write(buf);
            s.pipe(c).pipe(s);
        })
    })
}).listen(8888);