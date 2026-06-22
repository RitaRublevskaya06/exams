const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {

    let body = "";
    const boundary = req.headers["content-type"].split("boundary=")[1];

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        const parts = body.split(`--${boundary}`).filter((part) => part.trim() !== "" && part.trim() !== "--");

        const parsedData = parts.map((part) => {
            const headersEnd = part.indexOf("\r\n\r\n");
            const headers = part.slice(0, headersEnd).trim();
            const content = part.slice(headersEnd + 4, part.lastIndexOf("\r\n"));

            return { headers, content };
        });

        console.log("Parsed data:", parsedData);
        const fileContent = parsedData.map((data) => data.content).join("\n"); 

        fs.writeFile("MyFile2.txt", fileContent, (err) => {
            if (err) {
                console.error("Ошибка записи в файл:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: "Ошибка записи в файл" }));
                return;
            }
            console.log("Данные успешно записаны в MyFile2.txt");

        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success", data: parsedData }));

    });

}).listen(5000);