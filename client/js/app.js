(function() {

let socket = io.connect();

// Login
const LoginForm = document.getElementById('loginForm');
const ShowLogin = document.getElementById('show_login_form');
const Email = document.getElementById('email');
const Password = document.getElementById('password');
const LoginBtn = document.getElementById('loginBtn');
const LoginError = document.getElementById('login_error');

// Register
const RegisterForm = document.getElementById('registerForm');
const ShowRegister = document.getElementById('show_register_form');
const RegisterEmail = document.getElementById('email_reg');
const RegisterPassword = document.getElementById('password_reg');
const RegisterUsername = document.getElementById('username_reg');
const RegisterFullname = document.getElementById('fullname_reg');
const RegisterBtn = document.getElementById('registerBtn');
const RegisterError = document.getElementById('register_error');

//Chat
const SendToALlButton = document.getElementById('send_to_all');
// const SendToMeButton = document.getElementById('send_to_me');
const MessageInput = document.getElementById('message_input');
const Target = document.getElementById('target');
const Wrap = document.getElementById('wrap');
const All_Users_list = document.getElementById('all_users_list');

let new_data = [];
let this_user = [];

ShowLogin.addEventListener("click", function () {
    RegisterForm.classList.add('hidden');
    LoginForm.classList.remove('hidden');
});

ShowRegister.addEventListener("click", function () {
    LoginForm.classList.add('hidden');
    RegisterForm.classList.remove('hidden');
});

LoginBtn.addEventListener("click", function () {
    let login_user = {
        email: Email.value,
        password: Password.value
    }
    socket.emit('login', login_user);
});

RegisterBtn.addEventListener("click", function () {
    let register_user = {
        username: RegisterUsername.value,
        fullname: RegisterFullname.value,
        email: RegisterEmail.value,
        password: RegisterPassword.value
    }
    socket.emit('register', register_user);
    console.log('one');
});

SendToALlButton.addEventListener("click", function () {
    new_data = {
        "user": this_user.username,
        "msg": MessageInput.value
    }
    socket.emit('sendToAll',new_data);
});

// SendToMeButton.addEventListener("click", function () {
//     new_data = {
//         "user": this_user,
//         "msg": MessageInput.value
//     }
//
//     socket.emit('sendToAll',new_data );
// });

socket.on('currentUser', (user) => {
    this_user = user;
    document.getElementById('show_username').innerHTML = user.fullname;
    document.getElementById('auth_form').classList.add('hidden');
    Wrap.classList.remove("hidden");
});


socket.on('displayMessage', (message) => {
    let data = '';
    message.forEach(msg => {
        data += '<div class="block w-full my-2">' +
            '<span class="font-bold">' +
            msg.user +
            ' : ' +
            '</span>' +
            '<span>' +
            msg.msg
        '</span>'
        '</div>';
    });
    Target.innerHTML = data;
    MessageInput.innerHTML = '';
});

socket.on('showAllUsers', (users) => {
    console.log(users);
    let all_ol_users = "";
    users.forEach(user => {
        all_ol_users += '<li class="list-none px-8 my-2 flex justify-auto h-12">' +
            ' <span class="self-center w-2 h-2 bg-green-300 rounded-full">' +
            '</span>' +
            '<span class="self-center mx-2 w-8 h-8 bg-blue-400 rounded-full">' +
            '</span>' +
            '<span class="self-center text-white rounded-full">' +
            user.username +
            '</span>' +
            '</li>'
    });
    All_Users_list.innerHTML = all_ol_users;
});

socket.on("showLoginErrors", (errors) => {
    if(errors[0].email) {
        document.getElementById('email_error_login').innerHTML = errors[0].email;
    }
    if(errors[0].password) {
        document.getElementById('username_error_login').innerHTML = errors[0].username;
    }
    if(errors[0].error) {
        LoginError.innerHTML = errors[0].error;
    }

});

socket.on("showRegisterErrors", (errors) => {
    if(errors[0].fullname) {
       document.getElementById('fullname_error').innerHTML = errors[0].fullname;
       RegisterFullname.classList.add('border-red-400','hover:border-red-400');
    }
    else {
        RegisterFullname.classList.remove('border-red-400','hover:border-red-400');
        document.getElementById('fullname_error').innerHTML = '';
    }
    if(errors[0].email) {
        document.getElementById('email_error').innerHTML = errors[0].email;
    }
    if(errors[0].username) {
        document.getElementById('username_error').innerHTML = errors[0].username;
    }
    if(errors[0].error) {
        LoginError.innerHTML = errors[0].error;
    }

});

})();