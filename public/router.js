let express = require('express');
let path = require('path');

let router = express.Router();

let users = []

router.get('/', function(req, res) {
    console.log('Welcome to the server', users);

    if (checkUser()) {
        res.sendFile(path.join(__dirname, "index.html"));
    } else {
        res.sendFile(path.join(__dirname, "login.html"));
    }
});

router.use(express.json());
router.post("/login", (req, res) => {
    const receivedData = req.body;
    console.log('Received data:', receivedData);
    users.push(receivedData);
    res.redirect("/")
})

function checkUser() {
    return users.length > 0
}


module.exports = router;