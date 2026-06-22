const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;
    
    if (parsedUrl.pathname === '/search') {
        // Обработка query-параметров: /search?q=nodejs&page=2&limit=10
        const { q, page, limit, sort } = queryParams;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Query-параметры обработаны',
            params: {
                searchQuery: q || 'не указан',
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sort: sort || 'default'
            },
            results: [`Результаты по запросу "${q}"`, `Страница ${page}`, `Лимит ${limit}`]
        }));
    } 
    else if (parsedUrl.pathname === '/filter') {
        // /filter?category=books&price_min=100&price_max=500&inStock=true
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            filters: queryParams,
            count: Object.keys(queryParams).length
        }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Сервер на http://localhost:3000'));