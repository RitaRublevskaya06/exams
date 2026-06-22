// Импорт модуля http для создания HTTP клиента и сервера
const http = require('http');
// Импорт модуля fs для работы с файловой системой
const fs = require('fs');
// Импорт модуля path для работы с путями файлов
const path = require('path');

// Функция для скачивания файла по HTTP
function downloadFile(urlPath, filename, outputPath) {
    // Настройки для HTTP запроса
    const options = {
        hostname: 'localhost', // Имя хоста
        port: 3000, // Порт сервера
        path: urlPath, // Путь к файлу на сервере
        method: 'GET' // Метод HTTP запроса
    };
    
    // Создание HTTP запроса
    const req = http.request(options, (res) => {
        // Создание полного пути для сохранения файла
        const filePath = path.join(outputPath || __dirname, filename);
        // Создание потока записи в файл
        const fileStream = fs.createWriteStream(filePath);
        
        // Переменная для отслеживания общего количества полученных байт
        let totalBytes = 0;
        
        // Обработка получения данных ответа
        res.on('data', (chunk) => {
            // Увеличение счетчика полученных байт
            totalBytes += chunk.length;
            // Запись полученных данных в файл
            fileStream.write(chunk);
            // Вывод прогресса скачивания в консоль
            process.stdout.write(`\rПолучено: ${totalBytes} байт`);
        });
        
        // Обработка завершения получения данных
        res.on('end', () => {
            // Завершение записи в файл
            fileStream.end();
            // Вывод информации о сохраненном файле
            console.log(`\nФайл сохранен: ${filePath}`);
            console.log(`Размер: ${totalBytes} байт`);
        });
        
        // Обработка ошибок записи в файл
        fileStream.on('error', (err) => {
            // Вывод сообщения об ошибке записи
            console.error('Ошибка записи:', err.message);
        });
    });
    
    // Обработка ошибок HTTP запроса
    req.on('error', (error) => {
        // Вывод сообщения об ошибке загрузки
        console.error('Ошибка загрузки:', error.message);
    });
    
    // Завершение запроса
    req.end();
}

// Создание тестового сервера для проверки работы клиента
const testServer = http.createServer((req, res) => {
    // Обработка запроса для скачивания тестового файла
    if (req.url === '/download/test.txt') {
        // Создание содержимого тестового файла
        const content = 'Тестовый файл для скачивания\nСоздан: ' + new Date().toISOString();
        
        // Установка заголовков для скачивания файла
        res.writeHead(200, {
            'Content-Type': 'text/plain', // Тип содержимого
            'Content-Disposition': 'attachment; filename="test.txt"', // Заголовок для скачивания
            'Content-Length': Buffer.byteLength(content) // Размер содержимого
        });
        // Отправка содержимого файла
        res.end(content);
    } 
    // Обработка запроса для главной страницы
    else if (req.url === '/') {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html' });
        // Отправка HTML страницы с ссылкой для скачивания
        res.end('<h1>Сервер для тестирования скачивания</h1><a href="/download/test.txt">Скачать</a>');
    }
    // Обработка всех других запросов
    else {
        // Отправка ответа 404
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
        
        // Задержка перед началом скачивания
        setTimeout(() => {
            // Заголовок для демонстрации
            console.log('\n--- Скачивание файла ---');
            // Вызов функции для скачивания файла
            downloadFile('/download/test.txt', 'downloaded_test.txt', __dirname);
            
            // Задержка перед завершением процесса
            setTimeout(() => process.exit(0), 2000);
        }, 500);
    });
}

// Экспорт функции для использования в других модулях
module.exports = { downloadFile };