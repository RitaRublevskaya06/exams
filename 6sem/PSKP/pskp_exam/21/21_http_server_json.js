const http = require('http');

const server = http.createServer((req, res) => {
    // Обработка JSON-сообщения в запросе
    if (req.method === 'POST' && req.url === '/api/json') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const jsonData = JSON.parse(body);
                
                // Ответ также в JSON формате
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    receivedData: jsonData,
                    timestamp: new Date().toISOString(),
                    echo: jsonData
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Invalid JSON format'
                }));
            }
        });
    }
    else if (req.method === 'GET' && req.url === '/api/json') {
        // GET запрос с JSON ответом
        const responseData = {
            users: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ],
            total: 2
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(3000, () => console.log('JSON сервер на http://localhost:3000'));