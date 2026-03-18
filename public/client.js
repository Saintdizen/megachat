// public/client.js
const socket = io('http://155.212.135.199:3000');
let peer = null;
let localStream = null;
const localAudio = document.getElementById('local-audio');
const remoteAudio = document.getElementById('remote-audio');
const controls = document.getElementById('controls');

async function startChat() {
    try {
        // Get local audio stream only (video: false)
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localAudio.srcObject = localStream;
        controls.style.display = 'block';
        document.querySelector('button').style.display = 'none';

        // Initialize simple-peer
        // Initiator is set to true for one side to start the connection process
        peer = new SimplePeer({
            initiator: location.hash === '#init', // Use a hash in URL to differentiate initiator
            trickle: false, // Use complete SDP offers/answers
            stream: localStream // Add local stream
        });

        // --- SimplePeer Events ---
        peer.on('signal', signalData => {
            // Send signaling data to the server
            socket.emit('signal', { signal: signalData, callerID: socket.id });
        });

        peer.on('stream', stream => {
            // When a remote stream is received, play it in the remote audio element
            remoteAudio.srcObject = stream;
        });

        peer.on('error', (err) => console.error('Peer error:', err));

    } catch (err) {
        console.error('Failed to get local stream:', err);
        alert('Could not access microphone. Please allow access.');
    }
}

// --- Socket.io Events ---
socket.on('signal', (data) => {
    // When the server relays signaling data, pass it to the peer connection
    if (peer) {
        peer.signal(data.signal);
    }
});

// --- Controls ---
function toggleMute() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
        }
    }
}