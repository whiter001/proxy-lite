var net = require('net');
var local_host = '127.0.0.1';
var local_port = 8888;
const proxyPort = 7777;
const proxyHost = '192.156.33.154';
var srv = net.createServer(c=>{
    c.on('data', chunk=>{
        console.log('client connected');
        console.log('request chunk:',chunk.toString());
        var s = net.createConnection(proxyPort,proxyHost);
        s.write(chunk);
          
        s.on('data',d=>{
            console.log('socket connected');
            console.log('s data:',d.toString(),'\n');
            
            c.write(d.toString().replace('close','open'));
        });
        s.on('error',e=>{
            console.log('s err:',e.message);
        })
        c.pipe(c);
        s.on('end',()=>{
            console.log('socket disconnected');
        })
    });
    c.on('end',()=>{
        console.log('client disconnected');
    })
    c.on('error',e=>{
        console.log('client err:',e.message)
    })
});
srv.on('error',e=>{
    console.log('srv err:',e.message)
})
srv.listen(local_port);
// setTimeout(()=>{
// srv.close();
// console.log('srv closed');
// },5e3);

// httpreq();
function httpreq(){
    var http = require('http');
    var opt = {
        host:local_host,
        port:local_port,
        method:'get',
        path:'http://httpbin.org/get?a=1'
    };
    http.request(opt,res=>{
        res.on('data',d=>{
            console.log('client request:',d.toString());
        })
    }).end()
}
function httpsreq(){
    var http = require('http');
    const tls = require('tls');  
    const url = require('url');

    // 自定义地址
    const href = "https://www.baidu.com";
    // const href = "https://httpbin.org/get?a=3";
    // const href = "https://hq.sinajs.cn/list=sh601006";
    // href = 'https://api.github.com/user';



    var nurl = url.parse(href);
    var path = nurl.host + (nurl.protocol=="https:"?":443":":80");
    var req = http.request({  
        host:local_host,  
        port: local_port,
        method: 'CONNECT',
        path:path,
        headers: {
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3236.0 Safari/537.36',
        }       
    });  

    req.on('connect', function (res, socket, head) {
        var cts = tls.connect({ 
            host: nurl.host, 
            socket: socket,
        }, function () {  
            cts.write('GET '+nurl.path+' HTTP/1.1\r\nHost: '+nurl.host+'\r\n\r\n'); 
        });  

        // cts.on('data', function (data) {  
        // console.log("responseBody: ",data.toString());  
        // });  
        cts.on('data',d=>{
            console.log('https resp:',d.toString().slice(0,30));
        })
        cts.on('error', function(e){
            console.log("tls error:",e.message);
        })

    });  

    req.end();  
    req.on('error', (e) => {
        console.log(`request error: ${e.message}`);
    });
}
