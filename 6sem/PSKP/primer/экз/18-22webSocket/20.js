const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 5000, host: "localhost", path: "/broadcast" });

console.log("WebSocket сервер запущен на ws://localhost:5000/broadcast");

wss.on("connection", (ws) => {
    console.log("Клиент подключился");

    ws.on("message", (data) => {
        console.log(`Получено сообщение: ${data}`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`server: ${data}`);
            }
        });
    });

    ws.on("close", () => {
        console.log("Клиент отключился");
    });
});