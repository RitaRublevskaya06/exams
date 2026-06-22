const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const mp = require('multiparty');


const GET_hendler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (pathname === "/formparameter") {
        fs.readFile("form.html", "utf8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
                res.end("Ошибка при чтении файла");
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(data);
        });
    }
 
      
   else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
}

}
const POST_hendler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if ( req.url.startsWith("/formparameter")) {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
        });
        req.on("end", () => {

             const params = new URLSearchParams(body); 

            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.write("<h1>Полученные параметры:</h1>");
            res.write("<ul>");
            for (const [key, value] of params.entries()) {
                res.write(`<li>${key}: ${value}</li>`);
            }
            res.write("</ul>");
            res.end();
        });
    }
    

}

const server = http.createServer();
server.keepAliveTimeout = 3000;
server.on('connection', (socket) => {
    console.log('Соединение установлено');

    socket.on('close', () => {
        console.log('Соединение закрыто');
    });
});
server.on('request', (req, res) => {
    console.log(`Запрос на: ${req.url}`);
    if (req.method === "GET")
        GET_hendler(req, res);
    else if (req.method === "POST")
        POST_hendler(req, res);
    else {
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Метод не разрешен.');
    }
});
server.listen(5000, () => {
    console.log('Server running at http://localhost:5000/formparameter');
});

