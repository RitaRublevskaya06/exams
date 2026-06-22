const http = require('http');

const server = http.createServer((req, res) => {
    const { url, method } = req;
    
    // Маршрутизация
    if (url === '/api/resource') {
        switch (method) {
            case 'GET':
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'GET запрос обработан', data: { id: 1, name: 'Пример' } }));
                break;
            case 'POST':
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'POST запрос обработан' }));
                break;
            case 'PUT':
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'PUT запрос обработан' }));
                break;
            case 'DELETE':
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'DELETE запрос обработан' }));
                break;
            default:
                // Генерация ответа с кодом 405
                res.writeHead(405, { 
                    'Content-Type': 'text/plain',
                    'Allow': 'GET, POST, PUT, DELETE'
                });
                res.end('405 Method Not Allowed: Метод не поддерживается');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Сервер на http://localhost:3000'));