const http = require('http');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Простой парсинг multipart/form-data
function parseMultipart(body, boundary) {
    const parts = body.split(`--${boundary}`);
    const result = {};

    for (const part of parts) {
        if (!part || part === '--' || part === '--\r\n') continue;

        const headersEnd = part.indexOf('\r\n\r\n');
        if (headersEnd === -1) continue;

        const headers = part.substring(0, headersEnd);
        const content = part.substring(headersEnd + 4).replace(/\r\n$/, '');

        const nameMatch = headers.match(/name="([^"]+)"/);
        const filenameMatch = headers.match(/filename="([^"]+)"/);

        if (nameMatch) {
            if (filenameMatch) {
                result[nameMatch[1]] = { filename: filenameMatch[1], data: content };
            } else {
                result[nameMatch[1]] = content;
            }
        }
    }
    return result;
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // HTML форма для загрузки файлов
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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
    else if (req.method === 'POST' && req.url === '/upload') {
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)$/);

        if (!boundaryMatch) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Ожидается multipart/form-data');
            return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const parsed = parseMultipart(body, boundaryMatch[1]);

            if (parsed.file && parsed.file.data) {
                const filename = `${Date.now()}_${parsed.file.filename}`;
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, parsed.file.data);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: 'Файл успешно загружен',
                    filename: filename,
                    size: parsed.file.data.length,
                    path: filePath
                }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Файл не найден в запросе' }));
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Сервер для загрузки на http://localhost:3000'));