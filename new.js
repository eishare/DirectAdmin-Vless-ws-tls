process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});

const UUID = (process.env.UUID || "0cbbd5b1-2ba6-405f-b71d-03c92cb7b6e8").trim();
const DOMAIN = (process.env.DOMAIN || "your-domain.example.com").trim();
const NAME = "DirectAdmin-eishare";

const PORT = Number(process.env.PORT?.trim()) || 8080;
if (!PORT || PORT < 1000) {
  console.error("Invalid PORT:", process.env.PORT);
  process.exit(1);
}

const http = require("http");
const net = require("net");
const { WebSocket, createWebSocketStream } = require("ws");

const BEST = ["www.visa.cn", "usa.visa.com", "time.is", "www.wto.org"];
const uuidHex = UUID.replace(/-/g, "");

function gen(addr) {
  return `vless://${UUID}@${addr}:443?encryption=none&security=tls&sni=${DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#${NAME}`;
}

const server = http.createServer((req, res) => {
  if (req.url === "/") return res.end("VLESS WS TLS\n");
  if (req.url === `/${UUID}`) return res.end(BEST.map(d => gen(d)).join("\n\n") + "\n");
  res.statusCode = 404;
  res.end("404");
});

const wss = new WebSocket.Server({ server });

let connCount = 0;
const MAX_CONN = 120;   // DA 环境下这个数值最稳，内存不会爆

wss.on("connection", ws => {
  if (connCount >= MAX_CONN) {
    ws.close(1008, "full");
    return;
  }
  connCount++;

  ws.isAlive = true;
  const timer = setInterval(() => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  }, 60000);

  ws.on("pong", () => ws.isAlive = true);
  ws.on("close", () => {
    clearInterval(timer);
    connCount--;
  });

  ws.once("message", msg => {
    try {
      const id = msg.slice(1, 17);
      if (id.length !== 16) return ws.close();
      for (let i = 0; i < 16; i++) {
        if (id[i] !== parseInt(uuidHex.substr(i * 2, 2), 16)) return ws.close();
      }

      let p = 17;
      const port = msg.readUInt16BE(p); p += 2;
      const atyp = msg[p++];
      if (atyp !== 1) return ws.close();
      const host = `${msg[p++]}.${msg[p++]}.${msg[p++]}.${msg[p++]}`;

      ws.send(new Uint8Array([msg[0], 0]));

      const duplex = createWebSocketStream(ws);

      const remote = net.connect({ host, port }, function() {
        this.write(msg.slice(p));
        duplex.pipe(this).pipe(duplex);
      });

      remote.on("error", () => ws.close());
      // No setTimeout → connection never auto-closed
      // Only client or server disconnect will close it

    } catch (e) {
      ws.close();
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on 127.0.0.1:${PORT}`);
  BEST.forEach(d => console.log(gen(d)));
  console.log("\nAccess /" + UUID + " to get all nodes\n");
});
