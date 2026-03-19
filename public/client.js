const socket = io.connect('https://chuichat.ru');
//const socket = io.connect('https://localhost:8080');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let currentPeer = null;
let stream = null; // To hold local media stream

// 1. Get user media (webcam/microphone access)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(s => {
        stream = s;
        localVideo.srcObject = stream;
    })
    .catch(err => console.error("Failed to get local stream", err));

// 2. Socket.IO event handlers
socket.on('connect', () => {
    console.log('Connected to signaling server, your ID:', socket.id);
});

socket.on('signal', (data) => {
    console.log('Received signal:', data);
    if (currentPeer) {
        currentPeer.signal(data.signalData);
    } else {
        currentPeer = createPeer(data.from, false, stream);
        currentPeer.signal(data.signalData);
    }
});

// 3. Simple-peer logic
function createPeer(userId, initiator, stream) {
    const peer = new SimplePeer({
        initiator: initiator,
        trickle: false, // For simplicity; trickle: true requires more signaling logic
        stream: stream,
        config: { // Use public Google STUN servers for NAT traversal
            iceServers: [
                { urls: "stun:stun.rtc.yandex.net:3478" }
            ]
        }
    });

    peer.on('signal', data => {
        // When 'simple-peer' generates a signal, send it to the server to relay to the other user
        console.log('Sending signal:', data);
        socket.emit('signal', {
            to: userId,
            signalData: data
        });
    });

    peer.on('stream', stream => {
        // When the remote peer's stream arrives, display it
        console.log('Received remote stream');
        setTimeout(() => {
            remoteVideo.srcObject = stream;
        }, 250)
    });

    peer.on('error', err => {
        console.error('Peer error:', err);
    });

    return peer;
}

function create(userId) {
    const myCustomEvent = new CustomEvent('testEvent', {
        detail: {
            username: userId
        },
        bubbles: true, // Events can bubble up the DOM
        cancelable: true // Event can be canceled
    });
    window.dispatchEvent(myCustomEvent);

    if (!currentPeer && stream) {
        currentPeer = createPeer(userId, true, stream);
    }
}

window.addEventListener('testEvent', (event) => {
    console.log('New user connected:', event.detail.username);
    setTimeout(() => {
        if (!currentPeer) {
            create(event.detail.username)
        };
    }, 100)
});

