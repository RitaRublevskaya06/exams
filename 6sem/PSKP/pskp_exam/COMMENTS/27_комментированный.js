// Импорт модуля http для создания HTTP клиента и сервера
const http = require('http');
// Импорт модуля url для работы с URL
const url = require('url');

// Функция для создания HTTP запроса с query-параметрами
function makeRequestWithQueryParams(params) {
    // Преобразование объекта параметров в query-строку
    const queryString = new URLSearchParams(params).toString();
    // Создание полного пути с query-параметрами
    const path = `/search?${queryString}`;
    
    // Настройки для HTTP запроса
    const options = {
        hostname: 'localhost', // Имя хоста
        port: 3000, // Порт сервера
        path: path, // Путь с query-параметрами
        method: 'GET' // Метод HTTP запроса
    };
    
    // Создание HTTP запроса
    const req = http.request(options, (res) => {
        // Инициализация переменной для хранения данных ответа
        let data = '';
        // Обработка получения данных ответа
        res.on('data', chunk => { data += chunk; });
        // Обработка завершения получения данных
        res.on('end', () => {
            // Вывод статуса ответа
            console.log('Status:', res.statusCode);
            try {
                // Попытка парсинга ответа как JSON
                const json = JSON.parse(data);
                console.log('Response:', json);
            } catch {
                // Если не JSON, вывод как есть
                console.log('Response:', data);
            }
        });
    });
    
    // Обработка ошибок запроса
    req.on('error', (error) => {
        // Вывод сообщения об ошибке
        console.error('Error:', error.message);
    });
    
    // Завершение запроса
    req.end();
}

// Создание тестового сервера для проверки работы клиента
const testServer = http.createServer((req, res) => {
    // Парсинг URL с извлечением query-параметров
    const parsedUrl = url.parse(req.url, true);
    
    // Проверка пути запроса
    if (parsedUrl.pathname === '/search') {
        // Установка заголовков для JSON ответа
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Отправка JSON ответа с полученными query-параметрами
        res.end(JSON.stringify({
            message: 'Query-параметры получены',
            params: parsedUrl.query,
            timestamp: new Date().toISOString()
        }));
    } else {
        // Отправка ответа 404 для других путей
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
        console.log('\n--- Запрос с query-параметрами ---');
        // Вызов функции для тестового запроса с параметрами
        makeRequestWithQueryParams({
            q: 'nodejs',
            page: '2',
            limit: '10',
            sort: 'desc'
        });
        
        // Задержка перед завершением процесса (для демонстрации)
        setTimeout(() => process.exit(0), 1000);
    });
}

// Экспорт функции для использования в других модулях
module.exports = { makeRequestWithQueryParams };