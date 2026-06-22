const http = require("http");
const url = require("url");

const GET_handler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname.startsWith("/parameter/")) {
        const [, , xStr, yStr] = pathname.split("/");
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        
        if (!isNaN(x) && !isNaN(y)) {
            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            res.end(`Сумма: ${x + y}\nРазность: ${x - y}\nПроизведение: ${x * y}\nЧастное: ${x / y}`);
        } else {
            res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
            res.end(`Ошибка: параметры должны быть числами. Получено: ${xStr}, ${yStr}`);
        }
    }
    else {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Not Found\nИспользуйте: /parameter/число/число");
    }
}

const server = http.createServer();

server.on('connection', (socket) => {
    console.log(' Соединение установлено');
    socket.on('close', () => {
        console.log(' Соединение закрыто');
    });
});

server.on('request', (req, res) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    if (req.method === "GET") {
        GET_handler(req, res);
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Метод не разрешен. Используйте GET запросы.');
    }
});

const PORT = 5000;
server.listen(PORT, () => {
  
    console.log(`Адрес: http://localhost:${PORT}`);
    console.log(`   http://localhost:${PORT}/parameter/10/5`);
    
});