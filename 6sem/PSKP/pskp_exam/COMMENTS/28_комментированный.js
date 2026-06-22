// Импорт модуля http для создания HTTP клиента и сервера
const http = require('http');
// Импорт модуля querystring для работы с URL-encoded данными
const querystring = require('querystring');

// Функция для создания HTTP запроса с body-параметрами
function makeRequestWithBodyParams(data, method = 'POST') {
    // Преобразование объекта данных в строку в формате x-www-form-urlencoded
    const postData = querystring.stringify(data);
    
    // Настройки для HTTP запроса
    const options = {
        hostname: 'localhost', // Имя хоста
        port: 3000, // Порт сервера
        path: '/submit', // Путь запроса
        method: method, // Метод HTTP запроса (по умолчанию POST)
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Тип контента
            'Content-Length': Buffer.byteLength(postData) // Длина содержимого
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
                console.log('Response:', JSON.parse(responseData));
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
    
    // Отправка данных в теле запроса
    req.write(postData);
    // Завершение запроса
    req.end();
}

// Создание тестового сервера для проверки работы клиента
const testServer = http.createServer((req, res) => {
    // Проверка метода POST и URL /submit
    if (req.method === 'POST' && req.url === '/submit') {
        // Инициализация переменной для хранения тела запроса
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => { body += chunk; });
        // Обработка завершения получения данных
        req.on('end', () => {
            // Парсинг body-параметров из URL-encoded строки
            const params = querystring.parse(body);
            // Установка заголовков для JSON ответа
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // Отправка JSON ответа с полученными параметрами
            res.end(JSON.stringify({
                message: 'Body-параметры получены',
                received: params
            }));
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
        console.log('\n--- Запрос с body-параметрами ---');
        // Вызов функции для тестового запроса с данными
        makeRequestWithBodyParams({
            username: 'john_doe',
            email: 'john@example.com',
            age: '25',
            city: 'Minsk'
        });
        
        // Задержка перед завершением процесса (для демонстрации)
        setTimeout(() => process.exit(0), 1000);
    });
}

// Экспорт функции для использования в других модулях
module.exports = { makeRequestWithBodyParams };