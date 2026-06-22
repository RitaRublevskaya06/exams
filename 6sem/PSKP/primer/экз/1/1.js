const http = require('http');

const server = http.createServer((req, res) => {
    if(req.url === '/html'){
       
                 res.writeHead(200,{'Content-Type': 'text/html; charset=utf-8'});
                 res.end('success');
                    
    }
    else
    { 
        res.writeHead(404,{'Content-Type': 'text/html; charset=utf-8'});   
        res.end('not found');
    }

}).listen(5000);

    console.log(`Server running at http://localhost:5000/html`);
