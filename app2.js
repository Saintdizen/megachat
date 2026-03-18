const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require("node:path");
const cookieParser = require('cookie-parser')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use((req, res, next) => {
    let register_users = [
        {
            id: 1,
            name: "Иван Чувахин",
            login: "test1",
            password: "test2",
            key: "Basic dGVzdDE6dGVzdDI="
        }
    ];

    const user_auth = register_users.filter((user) => {
        return user.key === req.headers.authorization;
    })

    if (user_auth.length === 1) {
        return next()
    }

    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).send('Authentication required.')
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.set('trust proxy', 1)

let users = [];

app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, 'public/index.html'));

    res.cookie('username', 'john_doe', {
        maxAge: 900000, // 15 minutes
        httpOnly: false
    })

    res.send()
})

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    users = [];
    for (let user of io.sockets.sockets) {
        users.push({
            id: user[0].charAt(0).toUpperCase(),
        });
    }

    io.emit("all_users", users);

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        io.emit('message', socket.id.charAt(0).toUpperCase(), msg);
    });


    socket.on("disconnect", (reason) => {
        if (socket.active) {
            console.log("Temporary disconnection:", reason);
        } else {
            console.log("Forceful disconnection:", reason);
            users = [];
            for (let user of io.sockets.sockets) {
                users.push({
                    id: user[0].charAt(0).toUpperCase()
                });
            }
            io.emit("all_users", users);
        }
    });
});

server.listen(3000, () => {
    console.log('http://localhost:3000/');
});