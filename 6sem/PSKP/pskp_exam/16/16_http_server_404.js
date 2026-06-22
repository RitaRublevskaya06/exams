const http = require('http');

const server = http.createServer((req, res) => {
    // Простейшая маршрутизация
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Главная страница');
    } else {
        // Генерация ответа с кодом 404
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found: Запрашиваемый ресурс не существует');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});