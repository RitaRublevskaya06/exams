// Импорт модулей http и url
const http = require('http');
const url = require('url');

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Парсинг URL с query-параметрами (второй параметр true)
    const parsedUrl = url.parse(req.url, true);
    // queryParams - объект с query-параметрами из URL
    const queryParams = parsedUrl.query;
    
    // Проверяем путь запроса
    if (parsedUrl.pathname === '/search') {
        // Обработка query-параметров для поиска
        // Пример: /search?q=nodejs&page=2&limit=10
        // Деструктуризация queryParams для получения конкретных параметров
        const { q, page, limit, sort } = queryParams;
        
        // Устанавливаем заголовки и отправляем JSON ответ
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Query-параметры обработаны',
            params: {
                // q || 'не указан' - если параметр q отсутствует, используем значение по умолчанию
                searchQuery: q || 'не указан',
                // Преобразуем строки в числа с помощью parseInt
                page: page ? parseInt(page) : 1,      // По умолчанию страница 1
                limit: limit ? parseInt(limit) : 10,  // По умолчанию лимит 10
                sort: sort || 'default'               // По умолчанию сортировка 'default'
            },
            // Массив с результатами, используя полученные параметры
            results: [`Результаты по запросу "${q}"`, `Страница ${page}`, `Лимит ${limit}`]
        }));
    } 
    else if (parsedUrl.pathname === '/filter') {
        // Другой маршрут для фильтрации
        // Пример: /filter?category=books&price_min=100&price_max=500&inStock=true
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            // Возвращаем все query-параметры как есть
            filters: queryParams,
            // Подсчитываем количество параметров
            count: Object.keys(queryParams).length
        }));
    }
    else {
        // Если путь не /search и не /filter - 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => console.log('Сервер на http://localhost:3000'));