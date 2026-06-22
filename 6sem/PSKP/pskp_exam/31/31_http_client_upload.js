const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { Buffer } = require('buffer');

// HTTP-клиент: отправка upload-файлов
function uploadFile(filePath, fieldName = 'file') {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append(fieldName, fs.createReadStream(filePath));
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/upload',
            method: 'POST',
            headers: form.getHeaders()
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                console.log('Upload Status:', res.statusCode);
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve(data);
                }
            });
        });
        
        req.on('error', reject);
        form.pipe(req);
    });
}

// Альтернативная версия без сторонних модулей
function uploadFileSimple(filePath, fieldName = 'file') {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(filePath);
        const filename = path.basename(filePath);
        const boundary = '--------------------------' + Date.now();
        
        const body = Buffer.concat([
            Buffer.from(`--${boundary}\r\n`),
            Buffer.from(`Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`),
            Buffer.from('Content-Type: application/octet-stream\r\n\r\n'),
            fileData,
            Buffer.from(`\r\n--${boundary}--\r\n`)
        ]);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/upload',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve(data);
                }
            });
        });
        
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// Тестовый сервер
const testServer = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/upload') {
        let body = Buffer.from([]);
        req.on('data', chunk => { body = Buffer.concat([body, chunk]); });
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Файл получен',
                size: body.length,
                timestamp: new Date().toISOString()
            }));
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

if (require.main === module) {
    testServer.listen(3000, async () => {
        console.log('Тестовый сервер запущен');
        
        const testFilePath = path.join(__dirname, 'test_upload.txt');
        fs.writeFileSync(testFilePath, 'Тестовое содержимое файла для загрузки\nВремя: ' + new Date().toISOString());
        
        console.log('\n--- Загрузка файла ---');
        try {
            const result = await uploadFileSimple(testFilePath);
            console.log('Результат загрузки:', result);
        } catch (err) {
            console.error('Ошибка:', err.message);
        }
        
        setTimeout(() => process.exit(0), 2000);
    });
}

module.exports = { uploadFile, uploadFileSimple };