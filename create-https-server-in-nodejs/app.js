import express from "express";
import fs from "node:fs";
import https from "node:https"

const app = express();
const PORT = 4000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

const sslOptions = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem")
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🚀 HTTPS server running at https://localhost:${PORT}`);
});

// app.listen(PORT, () => {
//   console.log(`🚀 Visit http://localhost:${PORT}`);
// });
