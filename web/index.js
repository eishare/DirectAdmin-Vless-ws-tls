// DirectAdmin 终极稳定版 VLESS-WS-TLS
process.on("uncaughtException",()=>{});process.on("unhandledRejection",()=>{});

const UUID = (process.env.UUID ?? "0cbbd5b1-2ba6-405f-b71d-03c92cb7b6e8").trim();
const DOMAIN = (process.env.DOMAIN ?? "demo.example.com").trim();
const PORT = Number(process.env.PORT) || 0;  // 0=随机端口

const http = require("http");
const net = require("net");
const {WebSocket} = require("ws");

const ADDR = ["www.visa.cn","usa.visa.com","time.is","www.wto.org"];
const hex = UUID.replace(/-/g,"");

const server = http.createServer((q,r)=>{
  q.url===`/${UUID}` ? r.end(ADDR.map(a=>`vless://${UUID}@${a}:443?encryption=none&security=tls&sni=${DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#DA-${a}`).join("\n")+"\n") : r.end("OK");
});

// 关键：分离 HTTP 和 WS，解决 503 + exit code 1
const wss = new WebSocket.Server({noServer:true});
server.on("upgrade",(req,sock,head)=>req.url.includes(UUID)?wss.handleUpgrade(req,sock,head,ws=>wss.emit("connection",ws)):sock.destroy());

wss.on("connection",ws=>{
  ws.once("message",m=>{
    try{
      if(m.length<34)return ws.close();
      for(let i=0;i<16;i++)if(m[1+i]!==parseInt(hex.substr(i*2,2),16))return ws.close();

      let p=17;
      const atyp=m[p++];
      let host="";
      if(atyp===1)host=`${m[p++]}.${m[p++]}.${m[p++]}.${m[p++]}`;
      else if(atyp===2){const l=m[p++];host=new TextDecoder().decode(m.slice(p,p+=l));}
      else return ws.close();

      const port=m.readUInt16BE(p);
      ws.send(new Uint8Array([m[0],0]));

      const remote=net.connect(port,host,()=>{remote.write(m.slice(p+2))});
      ws.on("message",d=>remote.write(d));
      remote.on("data",d=>ws.send(d));
      remote.on("error",()=>ws.close());
      ws.on("close",()=>remote.destroy());
    }catch{ws.close()}
  });
});

// 必须 127.0.0.1 + 随机端口（0.0.0.0 必死）
server.listen(PORT,"127.0.0.1",()=>{
  console.log(`VLESS 稳定运行 → 127.0.0.1:${server.address().port}`);
});
