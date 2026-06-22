// Импорт модулей http и url
const http = require('http');
const url = require('url');

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Парсинг URL: второй параметр true означает парсинг query-параметров
    const parsedUrl = url.parse(req.url, true);
    
    // Разбиваем pathname на части по символу '/'
    // filter(p => p) удаляет пустые строки (например, при пути "/users/")
    const pathParts = parsedUrl.pathname.split('/').filter(p => p);
    
    // Обработка route-параметров: паттерн /users/123/posts/456
    if (pathParts[0] === 'users' && pathParts[2] === 'posts') {
        // Извлекаем параметры из пути
        // pathParts[0] = "users", pathParts[1] = "123", pathParts[2] = "posts", pathParts[3] = "456"
        const userId = pathParts[1];
        // Если postId не указан, используем значение по умолчанию
        const postId = pathParts[3] || 'не указан';
        
        // Отправляем JSON ответ с извлеченными параметрами
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Route-параметры обработаны',
            userId: userId,
            postId: postId
        }));
    } 
    // Обработка другого паттерна: /products/789
    else if (pathParts[0] === 'products' && pathParts[1]) {
        // Проверяем, что есть второй элемент в пути (productId)
        const productId = pathParts[1];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Товар найден',
            productId: productId,
            // Формируем имя товара на основе ID
            name: `Товар ${productId}`
        }));
    }
    else {
        // Если путь не соответствует ни одному паттерну - 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Запуск сервера
server.listen(3000, () => console.log('Сервер на http://localhost:3000'));