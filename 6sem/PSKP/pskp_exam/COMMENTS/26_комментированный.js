// Импорт модуля http для создания HTTP клиента и сервера
const http = require('http');

// Функция для создания HTTP запроса с route-параметрами
function makeRequestWithRouteParams(userId, postId) {
    // Настройки для HTTP запроса
    const options = {
        hostname: 'localhost', // Имя хоста
        port: 3000, // Порт сервера
        path: `/users/${userId}/posts/${postId}`, // Путь с route-параметрами
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
            // Вывод данных ответа
            console.log('Response:', data);
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
    // Поиск route-параметров в URL с помощью регулярного выражения
    const matches = req.url.match(/\/users\/(\d+)\/posts\/(\d+)/);
    // Проверка нахождения совпадений
    if (matches) {
        // Извлечение userId из первой группы совпадения
        const userId = matches[1];
        // Извлечение postId из второй группы совпадения
        const postId = matches[2];
        // Установка заголовков для JSON ответа
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Отправка JSON ответа с извлеченными параметрами
        res.end(JSON.stringify({
            message: 'Route-параметры получены',
            userId: userId,
            postId: postId
        }));
    } else {
        // Отправка ответа 404 если URL не соответствует шаблону
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
        console.log('\n--- Запрос с route-параметрами ---');
        // Вызов функции для тестового запроса
        makeRequestWithRouteParams(123, 456);
        
        // Задержка перед завершением процесса (для демонстрации)
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });
}

// Экспорт функции для использования в других модулях
module.exports = { makeRequestWithRouteParams };