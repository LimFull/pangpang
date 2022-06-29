const http = require('http');
const express = require('express');
const cors = require("cors");
const app = express();
const server = http.createServer(app);

const routes = require("./routes");


app.use(routes);
app.use(cors());



const io = require('socket.io')(server, {cors: {origin: "*"}});
const hostname = '127.0.0.1';
const port = 8001;


server.listen(port, hostname, () => {
  console.log(`Server running `)
})
