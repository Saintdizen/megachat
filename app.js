const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));
let clients = [];

io.on("connection", (socket) => {
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
                        return client.socketId != data.sessionId;
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

function Disconnect() {
    console.log("inside disconnect");
}

function SendOffer(offer) {
    const emitToSocket = clients.find((client) => {
        return client.userId == offer.userData.userToCall;
    }).socketId;
    this.broadcast.to(emitToSocket).emit("BackOffer", offer);
}

function SendAnswer(data) {
    const emitToSocket = clients.find((client) => {
        return client.userId == data.userData.currentUserId;
    }).socketId;
    this.broadcast.to(emitToSocket).emit("BackAnswer", data);
}

http.listen(port, () => {
    console.log(`Active on ${port}`);
});
