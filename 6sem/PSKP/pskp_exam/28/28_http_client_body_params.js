const http = require('http');
const querystring = require('querystring');

// HTTP-клиент: генерация запроса с body-параметрами
function makeRequestWithBodyParams(data, method = 'POST') {
    const postData = querystring.stringify(data);
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/submit',
        method: method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => { responseData += chunk; });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            try {
                console.log('Response:', JSON.parse(responseData));
            } catch {
                console.log('Response:', responseData);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('Error:', error.message);
    });
    
    req.write(postData);
    req.end();
}

// Тестовый сервер
const testServer = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = querystring.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Body-параметры получены',
                received: params
            }));
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

if (require.main === module) {
    testServer.listen(3000, () => {
        console.log('Тестовый сервер запущен');
        
        console.log('\n--- Запрос с body-параметрами ---');
        makeRequestWithBodyParams({
            username: 'john_doe',
            email: 'john@example.com',
            age: '25',
            city: 'Minsk'
        });
        
        setTimeout(() => process.exit(0), 1000);
    });
}

module.exports = { makeRequestWithBodyParams };