const http = require('http');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/form') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            // Парсинг x-www-form-urlencoded
            const formData = querystring.parse(body);
            
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                message: 'POST-запрос с content-type: x-www-form-urlencoded обработан',
                receivedData: formData,
                rawBody: body
            }));
        });
    }
    else if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>URLEncoded Form</title></head>
            <body>
                <h1>Отправка данных в формате x-www-form-urlencoded</h1>
                <form action="/form" method="POST" enctype="application/x-www-form-urlencoded">
                    <label>Имя: <input type="text" name="name"></label><br>
                    <label>Email: <input type="email" name="email"></label><br>
                    <label>Возраст: <input type="number" name="age"></label><br>
                    <input type="submit" value="Отправить">
                </form>
                <h2>Используйте curl для тестирования:</h2>
                <code>curl -X POST -d "name=John&email=john@example.com&age=25" http://localhost:3000/form</code>
            </body>
            </html>
        `);
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Сервер на http://localhost:3000'));