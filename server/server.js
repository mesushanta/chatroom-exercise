const express = require('express');
const http = require('http');
app = express();
const PORT = 9191;
let messages = [];
let active_users = [];

const clientPath = `${__dirname}/../client`;
const server = http.createServer(app);
app.use(express.static(clientPath));


const io = require('socket.io')(server);

server.listen(PORT, () =>{
    console.log("server running on "+ PORT);
});

io.on('connection', (socket) => {
    socket.on('setUser', (user) => {
        let new_user = {
            id: socket.id,
            name: user
        }
        active_users.push(new_user);
        socket.emit("displayMessage",messages);
        socket.emit("currentUser", (user));
        io.emit("showAllUsers", (active_users));
    })

    socket.on('sendToAll', (message) =>{
        socket.id
        messages.push(message);
        io.emit("displayMessage", (messages));
    });

    socket.on('sendToMe', (message) =>{
        socket.emit("displayMessage", (message));
    });

    socket.on('disconnect', function() {
        console.log(socket.id + ' has Got disconnect!');
    });
});



