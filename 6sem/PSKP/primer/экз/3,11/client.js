const http = require("http");

function sendRequest(x, y) {
    const path = `/parameter/${x}/${y}`;
    
    console.log(`\nОтправка: ${path}`);
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`Ответ (${res.statusCode}):`);
            console.log(data);
        });
    });
    
    req.on('error', (error) => {
        console.error('Ошибка:', error.message);
    });
    
    req.end();
}


sendRequest(10, 5);
setTimeout(() => sendRequest(7, 3), 1000);
setTimeout(() => sendRequest(15, 0), 2000);
setTimeout(() => sendRequest(8, 4), 3000);
setTimeout(() => sendRequest(100, 25), 4000);