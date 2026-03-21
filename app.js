const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());

let router = require("./public/router")

app.use('/', router);
app.use(express.static(__dirname + "/public"));
app.use((req, res, next) => {
    res.redirect("/");
})

let clients = [];

io.on("connection", (socket) => {
    console.log('Player connected: ' + socket.id);
    socket.on("RegClient", function (data) {
        if (!data.createCall) {
            let findClient = {};
            findClient = clients.find((client) => {
                return client.userId === data.currentUserId;
            });
            if (findClient && findClient.hasOwnProperty("userId")) {
                findClient = {};
                findClient.socketId = data.sessionId;
            } else {
                clients.push({ socketId: data.sessionId, userId: data.currentUserId });
                setTimeout(() => {
                    clients = clients.filter((client) => {
                        return client.socketId !== data.sessionId;
                    });
                    this.emit("SessionTimeOut");
                }, 1000 * 60 * 60);
            }
        }
    });

    socket.on("CallClient", function (data) {
        if (data.createCall && data.userToCall) {
            this.emit("CreatePeer", data);
        }
    });

    socket.on("Offer", SendOffer);
    socket.on("Answer", SendAnswer);
    socket.on("disconnect", Disconnect);
});

function Disconnect(reason) {
    let test = clients.filter((client) => {
        return client.socketId === this.id;
    });
    clients.splice(clients.indexOf(test[0]), 1)
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
        console.log(error);
    }
}

http.listen(port, () => {
    console.log(`Active on ${port}`);
});
