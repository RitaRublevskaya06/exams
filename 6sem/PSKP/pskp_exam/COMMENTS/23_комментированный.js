// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля fs для работы с файловой системой
const fs = require('fs');
// Импорт модуля path для работы с путями файлов
const path = require('path');

// Создание директории для загруженных файлов
const uploadDir = path.join(__dirname, 'uploads');
// Проверка существования директории, создание если не существует
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Функция для парсинга данных в формате multipart/form-data
function parseMultipart(body, boundary) {
    // Разделение тела запроса по границе (boundary)
    const parts = body.split(`--${boundary}`);
    // Объект для хранения результата парсинга
    const result = {};

    // Перебор всех частей данных
    for (const part of parts) {
        // Пропуск пустых частей и завершающей границы
        if (!part || part === '--' || part === '--\r\n') continue;

        // Поиск разделителя между заголовками и содержимым
        const headersEnd = part.indexOf('\r\n\r\n');
        // Пропуск частей без корректного разделителя
        if (headersEnd === -1) continue;

        // Извлечение заголовков части
        const headers = part.substring(0, headersEnd);
        // Извлечение содержимого части (удаление символов конца строки)
        const content = part.substring(headersEnd + 4).replace(/\r\n$/, '');

        // Поиск имени поля в заголовках
        const nameMatch = headers.match(/name="([^"]+)"/);
        // Поиск имени файла в заголовках
        const filenameMatch = headers.match(/filename="([^"]+)"/);

        // Если найдено имя поля
        if (nameMatch) {
            // Если это файл (есть имя файла)
            if (filenameMatch) {
                // Сохранение данных файла
                result[nameMatch[1]] = { filename: filenameMatch[1], data: content };
            } else {
                // Сохранение обычного текстового поля
                result[nameMatch[1]] = content;
            }
        }
    }
    // Возврат результата парсинга
    return result;
}

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Обработка GET запроса для главной страницы
    if (req.method === 'GET' && req.url === '/') {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML формы для загрузки файлов
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>Загрузка файлов</title></head>
            <body>
                <h1>Загрузка файлов на сервер</h1>
                <form action="/upload" method="POST" enctype="multipart/form-data">
                    <input type="file" name="file"><br><br>
                    <input type="submit" value="Загрузить">
                </form>
                <h2>Или используйте curl:</h2>
                <code>curl -F "file=@/path/to/file" http://localhost:3000/upload</code>
            </body>
            </html>
        `);
    }
    // Обработка POST запроса для загрузки файлов
    else if (req.method === 'POST' && req.url === '/upload') {
        // Получение типа контента из заголовков
        const contentType = req.headers['content-type'] || '';
        // Извлечение границы (boundary) из заголовка Content-Type
        const boundaryMatch = contentType.match(/boundary=(.+)$/);

        // Проверка наличия границы
        if (!boundaryMatch) {
            // Отправка ошибки если не multipart/form-data
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Ожидается multipart/form-data');
            return;
        }

        // Инициализация переменной для тела запроса
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => { body += chunk.toString(); });
        // Обработка завершения получения данных
        req.on('end', () => {
            // Парсинг multipart данных
            const parsed = parseMultipart(body, boundaryMatch[1]);

            // Проверка наличия файла в запросе
            if (parsed.file && parsed.file.data) {
                // Генерация уникального имени файла
                const filename = `${Date.now()}_${parsed.file.filename}`;
                // Создание полного пути для сохранения файла
                const filePath = path.join(uploadDir, filename);
                // Сохранение файла на диск
                fs.writeFileSync(filePath, parsed.file.data);

                // Отправка успешного ответа
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: 'Файл успешно загружен',
                    filename: filename,
                    size: parsed.file.data.length,
                    path: filePath
                }));
            } else {
                // Отправка ошибки если файл не найден
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Файл не найден в запросе' }));
            }
        });
    }
    // Обработка всех других запросов
    else {
        // Отправка ошибки 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => console.log('Сервер для загрузки на http://localhost:3000'));