const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require("node:path");

const app = express();
const server = http.createServer(app);
// Initialize Socket.IO server with CORS enabled
const io = socketio(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in example
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    console.log('A user connected:', socket.id);

    // When a user sends a signal, relay it to the target user
    socket.on('signal', (data) => {
        // data should contain { to: targetSocketId, signalData: ... }
        io.to(data.to).emit('signal', {
            from: socket.id,
            signalData: data.signalData
        });
    });

    // Notify other clients about a new user
    socket.broadcast.emit('user-connected', socket.id);

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

server.listen(8080, () => {
    console.log('Signaling server listening on port 8080');
});