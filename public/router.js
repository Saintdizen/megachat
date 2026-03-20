let express = require('express');
let path = require('path');

let router = express.Router();

let users = []

let user = undefined

router.get('/', function(req, res) {
    console.log('Welcome to the server', user);
    if (user) {
        res.sendFile(path.join(__dirname, "index.html"));
    } else {
        res.sendFile(path.join(__dirname, "login.html"));
    }
});

router.use(express.json());
router.post("/login", (req, res) => {
    const receivedData = req.body;
    console.log('Login:', receivedData);
    users.push(receivedData);
    user = checkUser(receivedData.name);
    res.redirect("/")
})

router.use(express.json());
router.post("/check", (req, res) => {
    const receivedData = req.body;
    console.log('Check:', receivedData);
    user = checkUser(receivedData.name);
    res.status(200).send(user);
    // res.redirect("/")
})

function checkUser(userName) {
    return users.find((user) => user.name === userName)
}


module.exports = router;