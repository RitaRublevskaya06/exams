const http = require('http');
const url = require('url');

const params = { x: 1, y: 2 };
const queryString = new URLSearchParams(params).toString();

const options = {
    host: 'localhost',
    path: `/?${queryString}`,
    port: 5000,
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`status code: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => body += chunk.toString());
    res.on('end', () => console.log(`body: ${body}`));
});

req.end();