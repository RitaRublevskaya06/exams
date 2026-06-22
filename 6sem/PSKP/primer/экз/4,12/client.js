const http = require("http");
const query = require("querystring");

let params = query.stringify({x:1, y:2});
const options = {
  host: "localhost",
  path: `/?${params}`,
  port: 5000,
  method: "GET",
};

const req = http.request(options, (res) => {
  console.log(`status code: ${res.statusCode}`);

  let body = "";

  res.on("data", (chunk) => {
    body += chunk.toString();
  });

  res.on("end", () => {
    console.log(`body: ${body}`);
  });
});

req.end();