const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathParts = parsedUrl.pathname.split('/').filter(p => p);
    
    // Обработка route-параметров: /users/123/posts/456
    if (pathParts[0] === 'users' && pathParts[2] === 'posts') {
        const userId = pathParts[1];
        const postId = pathParts[3] || 'не указан';
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Route-параметры обработаны',
            userId: userId,
            postId: postId
        }));
    } 
    else if (pathParts[0] === 'products' && pathParts[1]) {
        const productId = pathParts[1];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Товар найден',
            productId: productId,
            name: `Товар ${productId}`
        }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Сервер на http://localhost:3000'));