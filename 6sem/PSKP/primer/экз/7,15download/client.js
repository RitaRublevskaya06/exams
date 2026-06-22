const http = require("http");
const fs = require("fs");

const options = {
  host: "localhost",
  path: "/",
  port: 5000,
  method: "GET",
};

const req = http.request(options, (res) => {
  console.log(`status code: ${res.statusCode}`);

  const writeStream = fs.createWriteStream("полученная.jpg");

  res.pipe(writeStream);

  writeStream.on("finish", () => {
    writeStream.close();
    console.log(`file downloaded`);
  });
});

req.end();