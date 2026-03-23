const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
let router = require("./public/router")

let clients = [];
app.use(cookieParser());
app.use('/', router);
app.use(express.static(__dirname + "/public"));
app.use((req, res, next) => {
    res.redirect("/");
})

io.on("connection", (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on("RegClient", (data) => {
        if (!data.createCall) {
            let findClient = clients.find((client) => {
                return client.userId === data.currentUserId;
            });
            if (findClient === undefined) {
                clients.push({ socketId: data.sessionId, userId: data.currentUserId });
                setTimeout(() => {
                    clients = clients.filter((client) => {
                        return client.socketId !== data.sessionId;
                    });
                    this.emit("SessionTimeOut");
                }, 1000 * 60 * 60);
            } else {
                findClient.socketId = data.sessionId;
            }
            socket.emit("render_users", clients)
            socket.broadcast.emit("render_users", clients)
        }
    });

    socket.on("CallClient", (data) => {
        if (data.createCall && data.userToCall) {
            socket.emit("CreatePeer", data);
        } else {
            socket.emit("CreatePeer", data);
        }
    });
    socket.on("Offer", SendOffer);
    socket.on("Answer", SendAnswer);
    socket.on("disconnect", Disconnect);
});

function Disconnect(reason) {
    console.log(clients)
    let test = clients.filter((client) => {
        return client.socketId === this.id;
    });
    clients.splice(clients.indexOf(test[0]), 1)
    this.emit("render_users", clients)
    this.broadcast.emit("render_users", clients)
    console.log("Client disconnected", test[0], reason);
}

function SendOffer(offer) {
    catchError(this, () => {
        const emitToSocket = clients.find((client) => {
            return client.userId === offer.userData.userToCall;
        }).socketId;
        this.broadcast.to(emitToSocket).emit("BackOffer", offer);
    })
}

function SendAnswer(data) {
    catchError(this, () => {
        const emitToSocket = clients.find((client) => {
            return client.userId === data.userData.currentUserId;
        }).socketId;
        this.broadcast.to(emitToSocket).emit("BackAnswer", data);
    })
}

function catchError(main, func = () => {}) {
    try {
        func()
    } catch (error) {
        const serializedError = {
            message: error.message,
            stack: error.stack,
            name: error.name
        };
        main.emit('serverError', serializedError);
        console.error(error);
    }
}

http.listen(port, () => {
    console.log(`Active on ${port}`);
});
