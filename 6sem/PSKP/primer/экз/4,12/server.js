const http = require("http");
const url = require("url");

const server = http
  .createServer((req, res) => {
    res.statusCode = 200;

    const urlInfo = url.parse(req.url, true);

    const x = urlInfo.query["x"];
    const y = urlInfo.query["y"];

    res.end(`От сервера x: ${x}\ny: ${y}`);
  })
  .listen(5000);