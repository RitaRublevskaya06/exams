const http = require("http");

function sendRequest(x, y) {
    const postData = new URLSearchParams({ x, y }).toString();
    
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/body-parameter",
        method: "POST",
        headers: {
            "Content-Length": Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
            console.log(`Результат (${res.statusCode}):`);
            console.log(data);
        });
    });
    
    req.write(postData);
    req.end();
}

sendRequest(10, 5);