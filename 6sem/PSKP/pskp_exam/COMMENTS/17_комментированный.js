// Импорт модуля http
const http = require('http');

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Деструктуризация объекта запроса: получаем url и method
    const { url, method } = req;
    
    // Маршрутизация: проверяем путь запроса
    if (url === '/api/resource') {
        // Switch по методу HTTP запроса
        switch (method) {
            case 'GET':
                // Обработка GET запроса
                res.writeHead(200, { 'Content-Type': 'application/json' });
                // Отправляем JSON ответ
                res.end(JSON.stringify({ message: 'GET запрос обработан', data: { id: 1, name: 'Пример' } }));
                break;
            case 'POST':
                // Обработка POST запроса
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'POST запрос обработан' }));
                break;
            case 'PUT':
                // Обработка PUT запроса
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'PUT запрос обработан' }));
                break;
            case 'DELETE':
                // Обработка DELETE запроса
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'DELETE запрос обработан' }));
                break;
            default:
                // Генерация ответа с кодом 405 (Method Not Allowed)
                // Устанавливаем заголовок Allow, указывающий поддерживаемые методы
                res.writeHead(405, { 
                    'Content-Type': 'text/plain',
                    'Allow': 'GET, POST, PUT, DELETE'
                });
                res.end('405 Method Not Allowed: Метод не поддерживается');
        }
    } else {
        // Для всех других URL - 404 Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => console.log('Сервер на http://localhost:3000'));