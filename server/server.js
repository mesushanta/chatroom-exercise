const express = require('express');
const http = require('http');
app = express();
const PORT = 9191;

const clientPath = `${__dirname}/../client`;
const server = http.createServer(app);
app.use(express.static(clientPath));

const io = require('socket.io')(server);
server.listen(PORT, () =>{
    console.log("server running on "+ PORT);
});

io.on('connection', (socket) => {
    socket.on('sendToAll', (message) =>{
        io.emit("displayMessage", (message));
    });
    socket.on('sendToMe', (message) =>{
        socket.emit("displayMessage", (message));
    });
});



