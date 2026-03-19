const socket = io();

const userRegisterBtn = document.getElementById("usernameRegisterBtn");

userRegisterBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value;
    sessionStorage.setItem("webuser", username);

    const userRegSection = document.getElementById("user-reg-section");
    userRegSection.remove();

    const videoCallSection = document.getElementById("video-call-section");
    videoCallSection.hidden = false;

    initVideoCalling();
});

function initVideoCalling() {
    const video = document.querySelector("video");

    let client = {};

    const currentUserId = sessionStorage.getItem("webuser");
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();

            let userToCall;
            let callBtn = document.getElementById("calluser");
            callBtn.addEventListener(
                "click",
                () => {
                    userToCall = document.getElementById("usertocall").value;
                    socket.emit("CallClient", {
                        userToCall: userToCall,
                        createCall: true,
                        currentUserId: currentUserId,
                    });
                },
                false
            );

            socket.emit("RegClient", {
                userToCall: "",
                createCall: false,
                currentUserId: currentUserId,
                sessionId: socket.id,
            });

            function InitPeer(type) {
                let peer = new Peer({
                    initiator: type == "init" ? true : false,
                    stream: stream,
                    trickle: false,
                    config: {
                        iceServers: [
                            {
                                // Пример публичного STUN-сервера
                                urls: 'stun:stun.rtc.yandex.net:3478'
                            }
                        ]
                    }
                });
                peer.on("stream", function (stream) {
                    CreateVideo(stream);
                });
                peer.on("close", function (data) {
                    console.log(data);
                    document.getElementById("peerVideo").remove();
                    peer.destroy();
                    sessionStorage.clear()
                });
                return peer;
            }

            function MakePeer(userData) {
                client.gotAnswer = false;
                let peer = InitPeer("init");
                peer.on("signal", (data) => {
                    data = { ...data, userData: userData };
                    if (!client.gotAnswer) {
                        socket.emit("Offer", data);
                    }
                });
                client.peer = peer;
            }

            function FrontAnswer(offer) {
                let peer = InitPeer("notInit");
                peer.on("signal", (data) => {
                    data = { ...data, userData: offer.userData };
                    socket.emit("Answer", data);
                });
                peer.signal(offer);
            }

            function SignalAnswer(answer) {
                client.gotAnswer = true;
                let peer = client.peer;
                peer.signal(answer);
            }

            function CreateVideo(stream) {
                let video = document.createElement("video");
                video.id = "peerVideo";
                video.srcObject = stream;
                video.class = "embed-responsive-item";

                document.querySelector("#peerDiv").appendChild(video);
                video.play();
            }

            function SessionActive() {
                document.write("Session Active");
            }

            function resetApp() {
                console.log("reset");
                location.reload();
            }

            socket.on("BackOffer", FrontAnswer);
            socket.on("BackAnswer", SignalAnswer);
            socket.on("SessionActive", SessionActive);
            socket.on("CreatePeer", MakePeer);
            socket.on("SessionTimeOut", resetApp);
        })
        .catch((err) => {
            document.write(err);
        });
}