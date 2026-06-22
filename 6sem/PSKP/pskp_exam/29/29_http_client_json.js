const http = require('http');

// HTTP-клиент: генерация POST-запроса c json-сообщением
function sendJsonRequest(data, endpoint = '/api/json') {
    const jsonData = JSON.stringify(data);
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonData)
        }
    };
    
    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => { responseData += chunk; });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            try {
                const json = JSON.parse(responseData);
                console.log('JSON Response:', json);
            } catch {
                console.log('Response:', responseData);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('Error:', error.message);
    });
    
    req.write(jsonData);
    req.end();
}

// Тестовый сервер
const testServer = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/json') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const json = JSON.parse(body);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    received: json,
                    echo: json,
                    timestamp: new Date().toISOString()
                }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

if (require.main === module) {
    testServer.listen(3000, () => {
        console.log('Тестовый сервер запущен');
        
        console.log('\n--- POST-запрос с JSON сообщением ---');
        sendJsonRequest({
            name: 'Node.js Developer',
            skills: ['JavaScript', 'Node.js', 'HTTP'],
            experience: 3,
            projects: [
                { name: 'API Server', year: 2024 },
                { name: 'Web App', year: 2023 }
            ]
        });
        
        setTimeout(() => process.exit(0), 1000);
    });
}

module.exports = { sendJsonRequest };