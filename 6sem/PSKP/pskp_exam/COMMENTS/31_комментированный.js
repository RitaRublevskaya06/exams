// Импорт модуля http для создания HTTP клиента и сервера
const http = require('http');
// Импорт модуля fs для работы с файловой системой
const fs = require('fs');
// Импорт модуля path для работы с путями файлов
const path = require('path');
// Импорт модуля FormData для работы с multipart формами
const FormData = require('form-data');
// Импорт модуля Buffer для работы с бинарными данными
const { Buffer } = require('buffer');

// Функция для загрузки файла с использованием FormData
function uploadFile(filePath, fieldName = 'file') {
    return new Promise((resolve, reject) => {
        // Создание объекта FormData
        const form = new FormData();
        // Добавление файла в форму
        form.append(fieldName, fs.createReadStream(filePath));
        
        // Настройки для HTTP запроса
        const options = {
            hostname: 'localhost', // Имя хоста
            port: 3000, // Порт сервера
            path: '/upload', // Путь для загрузки
            method: 'POST', // Метод HTTP запроса
            headers: form.getHeaders() // Получение заголовков из FormData
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
                console.log('Upload Status:', res.statusCode);
                try {
                    // Попытка парсинга ответа как JSON
                    resolve(JSON.parse(data));
                } catch {
                    // Если не JSON, возврат как есть
                    resolve(data);
                }
            });
        });
        
        // Обработка ошибок запроса
        req.on('error', reject);
        // Передача данных формы в запрос
        form.pipe(req);
    });
}

// Альтернативная функция для загрузки файла без сторонних модулей
function uploadFileSimple(filePath, fieldName = 'file') {
    return new Promise((resolve, reject) => {
        // Чтение файла с диска
        const fileData = fs.readFileSync(filePath);
        // Получение имени файла из пути
        const filename = path.basename(filePath);
        // Создание уникальной границы для multipart данных
        const boundary = '--------------------------' + Date.now();
        
        // Создание тела запроса в формате multipart/form-data
        const body = Buffer.concat([
            Buffer.from(`--${boundary}\r\n`), // Начало части
            Buffer.from(`Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`), // Заголовки для файла
            Buffer.from('Content-Type: application/octet-stream\r\n\r\n'), // Тип содержимого
            fileData, // Данные файла
            Buffer.from(`\r\n--${boundary}--\r\n`) // Конец multipart данных
        ]);
        
        // Настройки для HTTP запроса
        const options = {
            hostname: 'localhost', // Имя хоста
            port: 3000, // Порт сервера
            path: '/upload', // Путь для загрузки
            method: 'POST', // Метод HTTP запроса
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`, // Тип контента с границей
                'Content-Length': body.length // Длина содержимого
            }
        };
        
        // Создание HTTP запроса
        const req = http.request(options, (res) => {
            // Инициализация переменной для хранения данных ответа
            let data = '';
            // Обработка получения данных ответа
            res.on('data', chunk => { data += chunk; });
            // Обработка завершения получения данных
            res.on('end', () => {
                try {
                    // Попытка парсинга ответа как JSON
                    resolve(JSON.parse(data));
                } catch {
                    // Если не JSON, возврат как есть
                    resolve(data);
                }
            });
        });
        
        // Обработка ошибок запроса
        req.on('error', reject);
        // Отправка тела запроса
        req.write(body);
        // Завершение запроса
        req.end();
    });
}

// Создание тестового сервера для проверки работы клиента
const testServer = http.createServer((req, res) => {
    // Проверка метода POST и URL /upload
    if (req.method === 'POST' && req.url === '/upload') {
        // Инициализация буфера для хранения тела запроса
        let body = Buffer.from([]);
        // Сбор данных тела запроса в буфер
        req.on('data', chunk => { body = Buffer.concat([body, chunk]); });
        // Обработка завершения получения данных
        req.on('end', () => {
            // Установка заголовков для JSON ответа
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // Отправка JSON ответа с информацией о полученном файле
            res.end(JSON.stringify({
                message: 'Файл получен',
                size: body.length,
                timestamp: new Date().toISOString()
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
    testServer.listen(3000, async () => {
        // Сообщение о запуске сервера
        console.log('Тестовый сервер запущен');
        
        // Создание тестового файла для загрузки
        const testFilePath = path.join(__dirname, 'test_upload.txt');
        fs.writeFileSync(testFilePath, 'Тестовое содержимое файла для загрузки\nВремя: ' + new Date().toISOString());
        
        // Заголовок для демонстрации
        console.log('\n--- Загрузка файла ---');
        try {
            // Вызов функции для загрузки файла
            const result = await uploadFileSimple(testFilePath);
            // Вывод результата загрузки
            console.log('Результат загрузки:', result);
        } catch (err) {
            // Вывод сообщения об ошибке
            console.error('Ошибка:', err.message);
        }
        
        // Задержка перед завершением процесса
        setTimeout(() => process.exit(0), 2000);
    });
}

// Экспорт функций для использования в других модулях
module.exports = { uploadFile, uploadFileSimple };