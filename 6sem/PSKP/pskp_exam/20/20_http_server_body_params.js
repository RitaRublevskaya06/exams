const http = require('http');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        
        // Сбор body-параметров
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            // Парсинг x-www-form-urlencoded
            const params = new URLSearchParams(body);
            const bodyParams = {};
            for (const [key, value] of params) {
                bodyParams[key] = value;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Body-параметры обработаны',
                receivedParams: bodyParams,
                rawBody: body
            }));
        });
    } 
    else if (req.method === 'POST' && req.url === '/register') {
        let body = '';
        
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                username: params.get('username'),
                email: params.get('email'),
                password: params.get('password') ? '***' : undefined
            }));
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Сервер на http://localhost:3000'));