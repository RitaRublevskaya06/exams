const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/download')) {
        const urlParts = req.url.split('?');
        const params = new URLSearchParams(urlParts[1] || '');
        const filename = params.get('file') || 'example.txt';
        
        // Создаем тестовый файл для скачивания
        const filePath = path.join(__dirname, filename);
        
        // Если файл не существует, создаем его
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, 'Это содержимое файла для скачивания\nДата: ' + new Date().toISOString());
        }
        
        // Установка заголовков для скачивания
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': fs.statSync(filePath).size
        });
        
        // Создание потока чтения файла и передача в ответ
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        
        readStream.on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Ошибка при скачивании файла');
        });
    }
    else {
        // HTML форма для скачивания
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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

server.listen(3000, () => console.log('Сервер для скачивания на http://localhost:3000'));
