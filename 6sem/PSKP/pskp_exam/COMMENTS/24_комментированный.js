// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля querystring для парсинга URL-encoded данных
const querystring = require('querystring');

// Создание HTTP сервера с обработкой запросов
const server = http.createServer((req, res) => {
    // Обработка POST запроса для маршрута /form
    if (req.method === 'POST' && req.url === '/form') {
        // Инициализация переменной для хранения тела запроса
        let body = '';
        
        // Обработка события получения данных
        req.on('data', chunk => {
            // Добавление полученных данных в тело запроса
            body += chunk.toString();
        });
        
        // Обработка события завершения получения данных
        req.on('end', () => {
            // Парсинг данных в формате x-www-form-urlencoded
            const formData = querystring.parse(body);
            
            // Установка заголовков для JSON ответа
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            // Отправка JSON ответа с результатами обработки
            res.end(JSON.stringify({
                message: 'POST-запрос с content-type: x-www-form-urlencoded обработан',
                receivedData: formData,
                rawBody: body
            }));
        });
    }
    // Обработка GET запроса для главной страницы
    else if (req.method === 'GET' && req.url === '/') {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML формы для ввода данных
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>URLEncoded Form</title></head>
            <body>
                <h1>Отправка данных в формате x-www-form-urlencoded</h1>
                <form action="/form" method="POST" enctype="application/x-www-form-urlencoded">
                    <label>Имя: <input type="text" name="name"></label><br>
                    <label>Email: <input type="email" name="email"></label><br>
                    <label>Возраст: <input type="number" name="age"></label><br>
                    <input type="submit" value="Отправить">
                </form>
                <h2>Используйте curl для тестирования:</h2>
                <code>curl -X POST -d "name=John&email=john@example.com&age=25" http://localhost:3000/form</code>
            </body>
            </html>
        `);
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