const express = require('express');
app = express();
const http = require('http');
const bcrypt = require("bcrypt");
const salt = bcrypt.genSalt(10);

const PORT = 9191;
let messages = [];
let all_users = []; // id, username, email, avatar, is_online, color
let active_users = [];

const clientPath = `${__dirname}/../client`;
const server = http.createServer(app);
const Emailregex = '/(.+)@(.+){2,}\.(.+){2,}/';

app.use(express.static(clientPath));

const io = require('socket.io')(server);

server.listen(PORT, () =>{
    console.log("server running on "+ PORT);
});

io.on('connection', (socket) => {

    socket.on('login', (user) => {
        let this_user = [];
        let email = user.email;
        let password = user.password;
        let errors = [];

        if(!email || email == '') {
            this_user = all_users.filter(function(usr) {
                return ((usr.email == email ) && (usr.password ==  bcrypt.hash(password, salt)));
            });
            console.log(this_user);

            if(this_user.length == 1) {
                let index = all_users.findIndex((usr => usr.email == email));
                all_users[index].is_online = true;
                socket.emit("displayMessage",messages);
                socket.emit("currentUser", (this_user));
                io.emit("showAllUsers", (active_users));
            }
            else {
                errors.push({error :"Credentials does not match"});
                socket.emit("showLoginErrors", (errors));
            }
        }

    });
    socket.on('register', (user) => {
        console.log('two');
        let this_user = [];
        let errors = [];
        let new_user = {
            id: socket.id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            password: bcrypt.hash(user.password, salt),
            avatar: 'default.jpg',
            is_online: true
        }


        if(!new_user.fullname || new_user.fullname == '') {
            errors.push({fullname : "Please enter fullname"});
            socket.emit("showRegisterErrors", (errors));
        }

        if(!new_user.username || new_user.username == '') {
            errors.push({username : "Please choose an username"});
            socket.emit("showRegisterErrors", (errors));
        }
        else {
            let find_user = all_users.filter(function(usr) {
                return usr.username == new_user.username;
            });
            if(find_user.length > 0) {
                errors.push({username : "Username already taken"});
            }
        }
        if(!new_user.email || new_user.email == '') {
            errors.push({email : "Please provide your email address"});
            socket.emit("showRegisterErrors", (errors));
        }
        else {
            if(!Emailregex.test(new_user.email)) {
                errors.push({email : "Invalid email address"});
            }
            else {
                let find_user = all_users.filter(function(usr) {
                    return usr.email == new_user.email;
                });
                if(find_user.length > 0) {
                    errors.push({email : "Email address is already registered"});
                }
            }
        }

        if(errors.length > 0) {
            socket.emit("showRegisterErrors", (errors));
        }
        else {
            all_users.push(new_user);
            socket.emit("displayMessage",messages);
            socket.emit("currentUser", (user.username));
        }

    });
    socket.on('sendToAll', (message) =>{
        messages.push(message);
        io.emit("displayMessage", (messages));
    });

    socket.on('sendToMe', (message) =>{
        socket.emit("displayMessage", (message));
    });

    socket.on('disconnect', function() {
        active_users = active_users.filter(function(item) {
            return item.id !== socket.id;
        })
        io.emit("showAllUsers", (active_users));
        // console.log(socket.id + ' has Got disconnect!');
    });

});


