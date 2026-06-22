
const http = require("http");
const fs = require("fs");

const httpServer = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/start") {
        const htmlStream = fs.createReadStream("./10-01.html");
        htmlStream.pipe(res);
        return;
    }

    res.statusCode = 400;
    res.end("Bad Request");
});

httpServer.listen(3000, () => {
    console.log("HTTP server running at http://localhost:3000/start");
});


const WebSocket = require("ws");

const wsServer = new WebSocket.Server({
    port: 4000,
    host: "localhost"
});

let n;
let k = 0;

wsServer.on("connection", (socket) => {
    console.log("WS client connected");

    socket.on("message", (data) => {
        console.log(`${data}`);
        n = parseInt(data.toString().split(" ")[1]);
    });

    socket.on("close", () => {
        console.log("WS client disconnected");
    });

    setInterval(() => {
        socket.send(`10-01-server: ${n} -> ${k}`);
        k++;
    }, 5000);
});
