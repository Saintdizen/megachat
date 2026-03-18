// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require("node:path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a user signals, relay the signal data to the other user
    socket.on('signal', (data) => {
        // In a real app, you would target a specific peer.
        // For simplicity, we broadcast to all other connected clients.
        socket.broadcast.emit('signal', {
            signal: data.signal,
            callerID: data.callerID
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});