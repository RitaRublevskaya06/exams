const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, "Budapest.jpg");

    res.writeHead(200, {
        "Content-Type": "image/jpg",
        "Content-Disposition": 'attachment; filename="Budapest.jpg"'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
});

server.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
