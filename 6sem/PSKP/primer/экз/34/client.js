const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
    name: 'Иван Петров',
    email: 'ivan@example.com',
    age: '25',
    message: 'Привет из формы!'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/submit',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`Статус: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
        body += chunk.toString();
    });
    
    res.on('end', () => {
        console.log('Ответ сервера:', JSON.parse(body));
    });
});

req.write(postData);
req.end();