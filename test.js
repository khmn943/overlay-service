// test.js
console.log("Test-Server startet auf Port 3000");
require("http")
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  })
  .listen(3000);
