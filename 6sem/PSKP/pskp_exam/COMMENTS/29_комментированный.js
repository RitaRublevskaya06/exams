// Импорт модуля http для создания HTTP клиента и сервера
const http = require('http');

// Функция для отправки POST запроса с JSON данными
function sendJsonRequest(data, endpoint = '/api/json') {
    // Преобразование объекта данных в JSON строку
    const jsonData = JSON.stringify(data);
    
    // Настройки для HTTP запроса
    const options = {
        hostname: 'localhost', // Имя хоста
        port: 3000, // Порт сервера
        path: endpoint, // Путь API эндпоинта
        method: 'POST', // Метод HTTP запроса
        headers: {
            'Content-Type': 'application/json', // Тип контента для JSON
            'Content-Length': Buffer.byteLength(jsonData) // Длина содержимого
        }
    };
    
    // Создание HTTP запроса
    const req = http.request(options, (res) => {
        // Инициализация переменной для хранения данных ответа
        let responseData = '';
        // Обработка получения данных ответа
        res.on('data', chunk => { responseData += chunk; });
        // Обработка завершения получения данных
        res.on('end', () => {
            // Вывод статуса ответа
            console.log('Status:', res.statusCode);
            try {
                // Попытка парсинга ответа как JSON
                const json = JSON.parse(responseData);
                console.log('JSON Response:', json);
            } catch {
                // Если не JSON, вывод как есть
                console.log('Response:', responseData);
            }
        });
    });
    
    // Обработка ошибок запроса
    req.on('error', (error) => {
        // Вывод сообщения об ошибке
        console.error('Error:', error.message);
    });
    
    // Отправка JSON данных в теле запроса
    req.write(jsonData);
    // Завершение запроса
    req.end();
}

// Создание тестового сервера для проверки работы клиента
const testServer = http.createServer((req, res) => {
    // Проверка метода POST и URL /api/json
    if (req.method === 'POST' && req.url === '/api/json') {
        // Инициализация переменной для хранения тела запроса
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => { body += chunk; });
        // Обработка завершения получения данных
        req.on('end', () => {
            try {
                // Парсинг тела запроса как JSON
                const json = JSON.parse(body);
                // Установка заголовков для JSON ответа
                res.writeHead(200, { 'Content-Type': 'application/json' });
                // Отправка JSON ответа с полученными данными
                res.end(JSON.stringify({
                    status: 'success',
                    received: json,
                    echo: json, // Эхо полученных данных
                    timestamp: new Date().toISOString()
                }));
            } catch (e) {
                // Обработка ошибки парсинга JSON
                res.writeHead(400, { 'Content-Type': 'application/json' });
                // Отправка JSON ответа об ошибке
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        // Отправка ответа 404 для других запросов
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Проверка, запущен ли файл как основной модуль
if (require.main === module) {
    // Запуск тестового сервера на порту 3000
    testServer.listen(3000, () => {
        // Сообщение о запуске сервера
        console.log('Тестовый сервер запущен');
        
        // Заголовок для демонстрации
        console.log('\n--- POST-запрос с JSON сообщением ---');
        // Вызов функции для отправки тестового JSON запроса
        sendJsonRequest({
            name: 'Node.js Developer',
            skills: ['JavaScript', 'Node.js', 'HTTP'],
            experience: 3,
            projects: [
                { name: 'API Server', year: 2024 },
                { name: 'Web App', year: 2023 }
            ]
        });
        
        // Задержка перед завершением процесса (для демонстрации)
        setTimeout(() => process.exit(0), 1000);
    });
}

// Экспорт функции для использования в других модулях
module.exports = { sendJsonRequest };