const http = require('http');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Упрощенный парсинг multipart/form-data
function parseMultipart(body, boundary) {
    const parts = body.split(`--${boundary}`);
    const result = {};
    
    for (const part of parts) {
        if (part === '--' || part === '' || part === '--\r\n') continue;
        
        const headersEnd = part.indexOf('\r\n\r\n');
        if (headersEnd === -1) continue;
        
        const headers = part.substring(0, headersEnd);
        const content = part.substring(headersEnd + 4, part.length - 2);
        
        const nameMatch = headers.match(/name="([^"]+)"/);
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        
        if (nameMatch) {
            const name = nameMatch[1];
            if (filenameMatch) {
                result[name] = {
                    filename: filenameMatch[1],
                    data: content
                };
            } else {
                result[name] = content;
            }
        }
    }
    return result;
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>Multipart Form</title></head>
            <body>
                <h1>Загрузка файлов (multipart/form-data)</h1>
                <form action="/upload" method="POST" enctype="multipart/form-data">
                    <label>Имя: <input type="text" name="username"></label><br>
                    <label>Файл: <input type="file" name="file"></label><br>
                    <input type="submit" value="Отправить">
                </form>
            </body>
            </html>
        `);
    }
    else if (req.method === 'POST' && req.url === '/upload') {
        const contentType = req.headers['content-type'];
        const boundaryMatch = contentType.match(/boundary=(.+)$/);
        
        if (!boundaryMatch) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Boundary not found');
            return;
        }
        
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const boundary = boundaryMatch[1];
            const parsed = parseMultipart(body, boundary);
            
            // Сохранение файла
            if (parsed.file && parsed.file.data) {
                const filename = `${Date.now()}_${parsed.file.filename}`;
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, parsed.file.data);
                
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    message: 'Данные получены',
                    username: parsed.username,
                    file: {
                        originalName: parsed.file.filename,
                        savedAs: filename,
                        size: parsed.file.data.length
                    }
                }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(parsed));
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Сервер multipart на http://localhost:3000'));