// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля fs для работы с файловой системой
const fs = require('fs');
// Импорт модуля path для работы с путями файлов
const path = require('path');

// Создание HTTP сервера с обработкой запросов
const server = http.createServer((req, res) => {
    // Проверка метода GET и URL начинающегося с /download
    if (req.method === 'GET' && req.url.startsWith('/download')) {
        // Разделение URL на путь и параметры запроса
        const urlParts = req.url.split('?');
        // Парсинг параметров запроса
        const params = new URLSearchParams(urlParts[1] || '');
        // Получение имени файла из параметров или использование значения по умолчанию
        const filename = params.get('file') || 'example.txt';
        
        // Создание полного пути к файлу
        const filePath = path.join(__dirname, filename);
        
        // Проверка существования файла
        if (!fs.existsSync(filePath)) {
            // Создание тестового файла, если он не существует
            fs.writeFileSync(filePath, 'Это содержимое файла для скачивания\nДата: ' + new Date().toISOString());
        }
        
        // Установка заголовков для скачивания файла
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream', // Тип для бинарных данных
            'Content-Disposition': `attachment; filename="${filename}"`, // Заголовок для скачивания
            'Content-Length': fs.statSync(filePath).size // Размер файла
        });
        
        // Создание потока чтения файла
        const readStream = fs.createReadStream(filePath);
        // Передача данных из потока в ответ
        readStream.pipe(res);
        
        // Обработка ошибок при чтении файла
        readStream.on('error', (err) => {
            // Установка заголовков для ошибки сервера
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            // Отправка сообщения об ошибке
            res.end('Ошибка при скачивании файла');
        });
    }
    // Обработка всех других запросов (главная страница)
    else {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с ссылками для скачивания
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>Скачивание файлов</title></head>
            <body>
                <h1>Скачивание файлов</h1>
                <a href="/download?file=test.txt">Скачать test.txt</a><br>
                <a href="/download?file=document.pdf">Скачать document.pdf</a><br>
                <a href="/download?file=image.jpg">Скачать image.jpg</a>
                <p><small>Файлы создаются автоматически при первом скачивании</small></p>
            </body>
            </html>
        `);
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => console.log('Сервер для скачивания на http://localhost:3000'));