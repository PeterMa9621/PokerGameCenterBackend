const express = require('express');
const cardC = ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12','C13'];
const cardD = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13'];
const cardH = ['H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H11','H12','H13'];
const cardS = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13'];
var currentPLay = {'abc123':[]};
const router = express.Router();

router.get('/:id', (req, res) => {
    var id = req.params.id;
    var arr = dealCards();
    console.log()
    res.status(200).send(arr[id]);

});

router.post('/', (req, res) => {
    res.send("Hello, bie7!");
    var arr = dealCards();
    console.log(arr[0]);

});

router.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
        ws.send("Received -> " + msg);
    });
    ws.send('Hello my wife Phoebe!');
});

function dealCards(){
    var S7 = Math.floor(Math.random()*4);
    var playersCard = [[],[],[],[]];
    var totalCards = [];

    playersCard[S7].push('S7');
    console.log(playersCard);
    totalCards.push.apply(totalCards, cardC);
    totalCards.push.apply(totalCards, cardD);
    totalCards.push.apply(totalCards, cardH);
    totalCards.push.apply(totalCards, cardS);
    totalCards.remove('S7');
    var shuffledCards = getMess(totalCards);

    for(var i = 0; i < 3; i++){
        if(i !== S7){
            var arr = shuffledCards.splice(0,13);
            console.log(shuffledCards.length);
            playersCard[i].push.apply(playersCard[i],arr);
        }
    }
    //console.log(shuffledCards.length);
    playersCard[S7].push.apply(playersCard[S7], shuffledCards);
    return playersCard;
}

function getMess(arr) {
    var n = arr.length;
    var newArr = [];
    while(n) {
        var i = Math.floor(Math.random()*n--);
        newArr.push(arr.splice(i, 1)[0]);
    }
    return newArr;
}


function isValid(selectedCard) {

}


Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
}

module.exports = router;