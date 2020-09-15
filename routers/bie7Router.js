const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.send("Hello, bie7!");
});

router.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
        ws.send("Received -> " + msg);
    });
    console.log('socket', req.testing);
    ws.send('Hello my wife Phoebe!');
});

module.exports = router;