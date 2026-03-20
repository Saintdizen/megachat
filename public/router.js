let express = require('express');
let path = require('path');

let router = express.Router();
router.use(express.json());

let users = []

router.get('/', (req, res) => {
    console.log('Welcome to the server', req.cookies.user);
    if (checkUser(req.cookies.user)) {
        res.sendFile(path.join(__dirname, "index.html"));
    } else {
        res.sendFile(path.join(__dirname, "login.html"));
    }
});

router.post("/login", (req, res) => {
    const receivedData = req.body;
    console.log('Login:', receivedData);
    users.push(receivedData);
    res.cookie("user", receivedData.name)
    res.send('');
})

router.post("/check", (req, res) => {
    const receivedData = req.body;
    console.log('Check:', receivedData);
    res.send('');
})

function checkUser(userName) {
    return users.find((user) => user.name === userName)
}


module.exports = router;