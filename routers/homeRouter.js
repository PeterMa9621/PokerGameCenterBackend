const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Poker Game Center, author: Jingyuan Ma and Yifei Bai.");
});

module.exports = router;