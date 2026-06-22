const http = require('http');
const url = require('url');
const data = require('./DB');
const db = new data.DB();

db.on('GET', (req, res) => {
    console.log('DB.GET');
    res.end(JSON.stringify(db.select()));
});
db.on('POST', (req, res) => {
    console.log('DB.POST');
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        const parsedData = JSON.parse(data);
        const result = db.insert(parsedData);
        if (result.error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: result.error }));
        } else {
            res.end(JSON.stringify(result));
        }
    });
});

db.on('PUT', (req, res) => {
    console.log('DB.PUT');
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        const parsedData = JSON.parse(data);
        const result = db.update(parsedData);
        if (result.error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: result.error }));
        } else {
            res.end(JSON.stringify(result));
        }
    });
});

db.on('DELETE', (req, res) => {
    console.log('DB.DELETE');
    const parsedUrl = url.parse(req.url, true);
    const id = parsedUrl.query.id;
    const result = db.delete(id);
    if (result.error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.error }));
    } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    }
});


http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url);
    
    if (parsedUrl.pathname === '/api/db') {
        const supportedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        
        if (!supportedMethods.includes(request.method)) {
         
            response.writeHead(405, {
                'Content-Type': 'application/json',
                'Allow': supportedMethods.join(', ')
            });
            response.end(JSON.stringify({
                error: 'Method Not Allowed',
                message: `Метод ${request.method} не поддерживается для ${parsedUrl.pathname}`,
                allowedMethods: supportedMethods
            }));
        } else {
            db.emit(request.method, request, response);
        }
    } else {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            error: 'Not Found',
            message: `Путь ${parsedUrl.pathname} не существует`
        }));
    }
}).listen(5000);

console.log(`Server running at http://localhost:5000/api/db`);