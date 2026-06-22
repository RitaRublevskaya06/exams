// Импорт модуля http для создания HTTP сервера
const http = require('http');

// Создание HTTP сервера с обработкой запросов
const server = http.createServer((req, res) => {
    // Проверка метода запроса и URL для маршрута /submit
    if (req.method === 'POST' && req.url === '/submit') {
        // Инициализация переменной для хранения тела запроса
        let body = '';
        
        // Обработка события получения данных (chunk - часть данных)
        req.on('data', chunk => {
            // Добавление полученных данных в тело запроса
            body += chunk.toString();
        });
        
        // Обработка события завершения получения данных
        req.on('end', () => {
            // Парсинг данных в формате x-www-form-urlencoded
            const params = new URLSearchParams(body);
            // Создание объекта для хранения параметров из тела
            const bodyParams = {};
            // Перебор всех параметров и добавление их в объект
            for (const [key, value] of params) {
                bodyParams[key] = value;
            }
            
            // Установка заголовков ответа
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // Отправка JSON ответа с результатами обработки
            res.end(JSON.stringify({
                message: 'Body-параметры обработаны',
                receivedParams: bodyParams,
                rawBody: body
            }));
        });
    } 
    // Проверка метода запроса и URL для маршрута /register
    else if (req.method === 'POST' && req.url === '/register') {
        // Инициализация переменной для хранения тела запроса
        let body = '';
        
        // Обработка события получения данных (без преобразования в строку)
        req.on('data', chunk => { body += chunk; });
        // Обработка события завершения получения данных
        req.on('end', () => {
            // Парсинг данных в формате x-www-form-urlencoded
            const params = new URLSearchParams(body);
            
            // Установка заголовков ответа
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // Отправка JSON ответа с данными пользователя
            res.end(JSON.stringify({
                // Получение параметра username
                username: params.get('username'),
                // Получение параметра email
                email: params.get('email'),
                // Получение параметра password (скрытый)
                password: params.get('password') ? '***' : undefined
            }));
        });
    }
    // Обработка всех других запросов
    else {
        // Установка заголовков для ответа 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        // Отправка текста ошибки 404
        res.end('404 Not Found');
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => console.log('Сервер на http://localhost:3000'));