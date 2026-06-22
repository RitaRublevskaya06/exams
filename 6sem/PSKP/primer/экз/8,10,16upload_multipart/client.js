const { log } = require("console");
const http = require("http");
const fs = require("fs");

const boundary = 'lb9t6ann--lb9t6ann';

let body = `--${boundary}\r\n`;
body += 'Content-Disposition: form-data; name="file"; filename="MyFile.txt"\r\n';
body += 'Content-Type: text/plain\r\n\r\n';
body += fs.readFileSync("./MyFile.txt", "utf8");
body += `\r\n--${boundary}--\r\n`;

const options = {
    host: "localhost",
    path: "/",
    port: 5000,
    method: "POST",
    headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`
    },
};

const req = http.request(options, (res) => {
    log(`Status code: ${res.statusCode}`);

    let responseBody = "";

    res.on("data", (chunk) => {
        responseBody += chunk.toString();
    });

    res.on("end", () => {
        log(responseBody);
    });
});

req.on("error", (err) => {
    log("Request error:", err);
});

req.write(body);
req.end();