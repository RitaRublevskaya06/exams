const http = require('http');

// HTTP-клиент: генерация запроса с route-параметрами
function makeRequestWithRouteParams(userId, postId) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/users/${userId}/posts/${postId}`,
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
        });
    });
    
    req.on('error', (error) => {
        console.error('Error:', error.message);
    });
    
    req.end();
}

// Тестовый сервер для проверки
const testServer = http.createServer((req, res) => {
    const matches = req.url.match(/\/users\/(\d+)\/posts\/(\d+)/);
    if (matches) {
        const userId = matches[1];
        const postId = matches[2];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Route-параметры получены',
            userId: userId,
            postId: postId
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
        console.log('\n--- Запрос с route-параметрами ---');
        makeRequestWithRouteParams(123, 456);
        
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });
}

module.exports = { makeRequestWithRouteParams };