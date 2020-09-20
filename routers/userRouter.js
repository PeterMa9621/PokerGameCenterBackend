const express = require('express');
const router = express.Router();
const MongoDatabase = require('../database/mongodb');

router.get('/', (req, res) => {
    res.send("Poker Game Center, author: Jingyuan Ma and Yifei Bai.");
});

router.post('/register', async (req, res) => {
    let data = req.body;
    let userName = data['userName'];
    let password = data['password'];
    let succeed = await MongoDatabase.getInstance().insert({
        _id: userName,
        userName: userName,
        password: password,
        score: 0,
        numWin: 0,
        numGame: 0
    }, 'user', {
        _id: userName,
        userName: userName
    });

    if(succeed)
        res.status(200).send({succeed: true});
    else
        res.status(401).send({succeed: false, reason: 'User name has been registered!'});
});

router.post('/login', async (req, res) => {
    let data = req.body;
    let userName = data['userName'];
    let password = data['password'];
    let user = await MongoDatabase.getInstance().findOne({
        _id: userName,
        userName: userName,
        password: password
    }, 'user');
    if(user === null)
        res.status(401).send({succeed: false});
    else
        res.status(200).send({succeed: true, user: user});
});

module.exports = router;