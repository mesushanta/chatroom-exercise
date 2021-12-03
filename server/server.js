const express = require('express');
app = express();
const http = require('http');
const bcrypt = require("bcrypt");
const salt = bcrypt.genSalt(10);

const PORT = 9191;
let messages = [];
let all_users = []; // id, username, email, avatar, is_online, color

const clientPath = `${__dirname}/../client`;
const server = http.createServer(app);
const EmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;


app.use(express.static(clientPath));

const io = require('socket.io')(server);

server.listen(PORT, () =>{
    console.log("server running on "+ PORT);
});

io.on('connection', (socket) => {

    console.log(all_users);

    socket.on('login', (user) => {
        let this_user = [];
        let email = user.email;
        let password = user.password.toString();
        let hash = bcrypt.hash(password, parseInt(salt));
        let errors = [];
        if(email && email != '') {
            this_user = all_users.filter(function(usr) {
                return (usr.email == email);
            });

            if(this_user.length == 1) {
                console.log('yes email')
                let validPassword = bcrypt.compare(hash, this_user.password);
                if (!validPassword) {
                        errors.push({error :"Credentials does not match"});
                        socket.emit("showLoginErrors", (errors));
                    }
                    else {
                        let index = all_users.findIndex((usr => usr.email == email));
                        all_users[index].is_online = true;
                        all_users[index].id = socket.id;
                        socket.emit("displayMessage",messages);
                        socket.emit("currentUser", (this_user));
                        io.emit("showAllUsers", (all_users));
                    }
            }
        }

    });
    socket.on('register', (user) => {
        let password = '';
        let this_user = [];
        let errors = [];
        if(user.password && user.password != '') {
            password = bcrypt.hash(user.password.toString(), parseInt(salt));
        }
        let new_user = {
            id: socket.id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            password: password,
            avatar: 'default.jpg',
            is_online: true
        }


        if(!new_user.fullname || new_user.fullname == '') {
            errors.push({fullname : "Please enter fullname"});
        }

        if(!new_user.username || new_user.username == '') {
            errors.push({username : "Please choose an username"});
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
        }
        else {
            if(!EmailRegex.test(new_user.email)) {
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
            socket.emit("currentUser", (new_user));
            io.emit("showAllUsers", (all_users));
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
        let index = all_users.findIndex((usr => usr.id == socket.id));
        if(index && index != '') {
            all_users[index].is_online = false;
        }
        socket.emit("showAllUsers", (all_users));
    });

});


