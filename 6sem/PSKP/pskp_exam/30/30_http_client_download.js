const http = require('http');
const fs = require('fs');
const path = require('path');

function downloadFile(urlPath, filename, outputPath) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: urlPath,
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        const filePath = path.join(outputPath || __dirname, filename);
        const fileStream = fs.createWriteStream(filePath);
        
        let totalBytes = 0;
        
        res.on('data', (chunk) => {
            totalBytes += chunk.length;
            fileStream.write(chunk);
            process.stdout.write(`\rПолучено: ${totalBytes} байт`);
        });
        
        res.on('end', () => {
            fileStream.end();
            console.log(`\nФайл сохранен: ${filePath}`);
            console.log(`Размер: ${totalBytes} байт`);
        });
        
        fileStream.on('error', (err) => {
            console.error('Ошибка записи:', err.message);
        });
    });
    
    req.on('error', (error) => {
        console.error('Ошибка загрузки:', error.message);
    });
    
    req.end();
}

const testServer = http.createServer((req, res) => {
    if (req.url === '/download/test.txt') {
        const content = 'Тестовый файл для скачивания\nСоздан: ' + new Date().toISOString();
        
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment; filename="test.txt"',
            'Content-Length': Buffer.byteLength(content)
        });
        res.end(content);
    } 
    else if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Сервер для тестирования скачивания</h1><a href="/download/test.txt">Скачать</a>');
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

if (require.main === module) {
    testServer.listen(3000, () => {
        console.log('Тестовый сервер запущен');
        
        setTimeout(() => {
            console.log('\n--- Скачивание файла ---');
            downloadFile('/download/test.txt', 'downloaded_test.txt', __dirname);
            
            setTimeout(() => process.exit(0), 2000);
        }, 500);
    });
}

module.exports = { downloadFile };