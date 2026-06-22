const http = require("http");

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/body-parameter") {
        let body = "";
        
        req.on("data", chunk => body += chunk);
        
        req.on("end", () => {
            const params = new URLSearchParams(body);
            const x = parseFloat(params.get("x"));
            const y = parseFloat(params.get("y"));
            
            if (!isNaN(x) && !isNaN(y)) {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(`Сумма: ${x + y}\nРазность: ${x - y}\nПроизведение: ${x * y}\nЧастное: ${x / y}`);
            } else {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("Ошибка: x и y должны быть числами");
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
});

server.listen(5000, () => {
    console.log("Сервер запущен на http://localhost:5000");
    console.log("POST запросы на /body-parameter");
});