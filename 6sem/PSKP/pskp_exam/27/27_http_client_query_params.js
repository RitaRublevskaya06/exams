const http = require('http');
const url = require('url');

// HTTP-клиент: генерация запроса с query-параметрами
function makeRequestWithQueryParams(params) {
    const queryString = new URLSearchParams(params).toString();
    const path = `/search?${queryString}`;
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            try {
                const json = JSON.parse(data);
                console.log('Response:', json);
            } catch {
                console.log('Response:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('Error:', error.message);
    });
    
    req.end();
}

// Тестовый сервер
const testServer = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/search') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Query-параметры получены',
            params: parsedUrl.query,
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Демонстрация
if (require.main === module) {
    testServer.listen(3000, () => {
        console.log('Тестовый сервер запущен');
        
        console.log('\n--- Запрос с query-параметрами ---');
        makeRequestWithQueryParams({
            q: 'nodejs',
            page: '2',
            limit: '10',
            sort: 'desc'
        });
        
        setTimeout(() => process.exit(0), 1000);
    });
}

module.exports = { makeRequestWithQueryParams };