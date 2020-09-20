const Bie7Container = require("../common/Bie7Container");
const PokerController = require("../controller/bie7/PokerController");
const SimpleTest = require("../test/SimpleTest");
const {expressWs} = require('../index');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    let data = Bie7Container.getRoomsInfo();
    res.send(data);
});

router.get('/test', (req, res) => {
    let test = new SimpleTest();
    test.test();
});

router.ws('/:room_id/:user_name', function(ws, req) {
    let roomId = req.params['room_id'];
    let userName = req.params['user_name'];

    ws.on('message', function(msg) {
        console.log(msg);
        PokerController.doAction(msg);
    });

    ws.on('close', function close(e) {
        console.log(userName + ' close');
        PokerController.removePlayerConnection(roomId, userName);
        PokerController.clearBoard(roomId);
    });

    PokerController.initPlayerConnection(roomId, userName, ws);
});

module.exports = router;