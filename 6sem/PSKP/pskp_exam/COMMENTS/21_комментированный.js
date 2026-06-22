// Импорт модуля http для создания HTTP сервера
const http = require('http');

// Создание HTTP сервера с обработкой запросов
const server = http.createServer((req, res) => {
    // Обработка POST запроса для маршрута /api/json (JSON-сообщение)
    if (req.method === 'POST' && req.url === '/api/json') {
        // Инициализация переменной для хранения тела запроса
        let body = '';
        
        // Обработка события получения данных
        req.on('data', chunk => {
            // Добавление полученных данных в тело запроса
            body += chunk.toString();
        });
        
        // Обработка события завершения получения данных
        req.on('end', () => {
            try {
                // Парсинг тела запроса из JSON формата
                const jsonData = JSON.parse(body);
                
                // Установка заголовков для JSON ответа
                res.writeHead(200, { 'Content-Type': 'application/json' });
                // Отправка JSON ответа с данными
                res.end(JSON.stringify({
                    status: 'success',
                    receivedData: jsonData,
                    timestamp: new Date().toISOString(),
                    echo: jsonData
                }));
            } catch (error) {
                // Обработка ошибки парсинга JSON
                res.writeHead(400, { 'Content-Type': 'application/json' });
                // Отправка JSON ответа об ошибке
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Invalid JSON format'
                }));
            }
        });
    }
    // Обработка GET запроса для маршрута /api/json
    else if (req.method === 'GET' && req.url === '/api/json') {
        // Создание данных для ответа в JSON формате
        const responseData = {
            users: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ],
            total: 2
        };
        
        // Установка заголовков для JSON ответа
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Отправка JSON ответа с данными пользователей
        res.end(JSON.stringify(responseData));
    }
    // Обработка всех других запросов
    else {
        // Установка заголовков для ответа 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        // Отправка JSON ответа об ошибке
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => console.log('JSON сервер на http://localhost:3000'));