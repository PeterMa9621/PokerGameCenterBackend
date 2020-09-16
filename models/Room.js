const Bie7ActionType = require("../common/Bie7ActionType");
const PokerType = require("../common/PokerType");
const PokerUtility = require("../common/PokerUtility");

const cardC = ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12','C13'];
const cardD = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13'];
const cardH = ['H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H11','H12','H13'];
const cardS = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13'];

class Room {
    constructor(id) {
        this.id = id;
        this.players = {};
        this.orderedPlayers = [];
        this.types = [PokerType.CLUB, PokerType.DIAMOND, PokerType.HEART, PokerType.SPADE];
        this.initPokerBoard();
    }

    initPokerBoard() {
        this.currentPokerBoard = {};
        for(let type of this.types) {
            this.currentPokerBoard[type] = [];
        }
    }

    canStartGame() {
        if(Object.keys(this.players).length === 4) {
            for(let userName in this.players) {
                if(!this.players[userName].isPrepared)
                    return false;
            }
            return true;
        }
        return false;
    }

    startGame() {
        this.dealRandomPoker();
        for(let userName in this.players) {
            let player = this.players[userName];
            player.getWebSocket().send(JSON.stringify({
                action: 'start',
                pokers: player.currentPokers
            }));
        }
    }

    addPlayer(player) {
        if(this.players.length > 4)
            return;
        this.players[player.userName] = player;
        this.orderedPlayers.push(player);
        this.sendAllPlayerData();
    }

    getPlayer(userName) {
        return this.players[userName];
    }

    removePlayer(userName) {
        delete this.players[userName];
        for(let i=0; i<this.orderedPlayers.length; i++) {
            let player = this.orderedPlayers[i];
            if(player.userName === userName) {
                this.orderedPlayers.splice(i, 1);
            }
        }
        this.sendAllPlayerData();
    }

    sendAllPlayerData() {
        this.sendMessageToAllPlayers(JSON.stringify({
            action: Bie7ActionType.JOIN,
            players: this.serializePlayers(),
            orderedPlayers: this.serializeOrderedPlayers()
        }));
    }

    sendMessageToAllPlayers(msg) {
        for(let eachUserName in this.players) {
            let player = this.players[eachUserName];
            player.getWebSocket().send(msg);
        }
    }

    serializePlayers() {
        let players = {};
        for(let userName in this.players) {
            players[userName] = this.players[userName].serialize();
        }
        return players;
    }

    serializeOrderedPlayers() {
        let players = [];
        for(let player of this.orderedPlayers) {
            players.push(player.serialize());
        }
        return players;
    }

    dealRandomPoker() {
        let players = this.players;
        let numPlayer = Object.keys(players).length;
        if(numPlayer !== 4) {
            throw "Number of player is not 4!";
        }
        let randomPokers = this.dealCards();
        let index = 0;
        for(let userName in players) {
            if(randomPokers[index][0] === 'S7') {
                players[userName].setMyTurn(true);
            }
            let pokerList = PokerUtility.convertPokerCodesToPokerList(randomPokers[index]);
            players[userName].setCurrentPokers(pokerList);
            index ++;
        }
    }

    dealCards(){
        let S7 = Math.floor(Math.random()*4);
        let playersCard = [[],[],[],[]];
        let totalCards = [];

        playersCard[S7].push('S7');
        //console.log(playersCard);
        totalCards.push.apply(totalCards, cardC);
        totalCards.push.apply(totalCards, cardD);
        totalCards.push.apply(totalCards, cardH);
        totalCards.push.apply(totalCards, cardS);
        totalCards.remove('S7');
        let shuffledCards = this.getMess(totalCards);

        for(let i = 0; i < 4; i++){
            if(i !== S7){
                let arr = shuffledCards.splice(0,13);
                //console.log(shuffledCards.length);
                playersCard[i].push.apply(playersCard[i],arr);
            }
        }
        //console.log(shuffledCards.length);
        playersCard[S7].push.apply(playersCard[S7], shuffledCards);
        return playersCard;
    }

    getMess(arr) {
        let n = arr.length;
        let newArr = [];
        while(n) {
            let i = Math.floor(Math.random()*n--);
            newArr.push(arr.splice(i, 1)[0]);
        }
        return newArr;
    }

    checkValid(card){
        switch (card.pokerType) {
            case PokerType.CLUB:
                var result = this.isValid(card.number,'C',this.currentPokerBoard[PokerType.CLUB]);
                if(result[0]){

                    this.currentPokerBoard[PokerType.CLUB].push(result[1]);
                }else{
                    return false
                }
                break;

            case PokerType.DIAMOND:
                var result = this.isValid(card.number,'D',this.currentPokerBoard[PokerType.DIAMOND]);
                if(result[0]){

                    this.currentPokerBoard[PokerType.DIAMOND].push(result[1]);
                }else{
                    return false
                }
                break;

            case PokerType.HEART:
                var result = this.isValid(card.number,'H',this.currentPokerBoard[PokerType.HEART]);
                if(result[0]){
                    this.currentPokerBoard[PokerType.HEART].push(result[1]);
                }else{
                    return false
                }
                break;

            case PokerType.SPADE:
                var result = this.isValid(card.number,'S',this.currentPokerBoard[PokerType.SPADE]);
                if(result[0]){
                    console.log(result[1]);
                    this.currentPokerBoard[PokerType.SPADE].push(result[1]);
                }else{
                    return false
                }
                break;
            default:
                console.log("999");
                return false;
        }

        this.sendMessageToAllPlayers(JSON.stringify({
            action: 'play card',
            poker: {...card}
        }));

        return true;
    }

    isValid(num, type, cardArr){

        if((7 < num)&&(num < 14)){
            //console.log("7 13");
            let small = num - 1;
            let cardCode = type + small;

            if (cardArr.indexOf(cardCode) !== -1){
                return [true, type + num];
            }else{
                return [false];
            }

        }else if(num < 7){

            let big = num + 1;
            let cardCode = type + big;

            console.log(cardCode);
            if (cardArr.indexOf(cardCode) !== -1){
                return [true, type + num];
            }else{
                return [false];
            }
        }else if (num === 7){
            if ((this.currentPokerBoard[PokerType.SPADE].length === 0) && (type !== 'S')){
                return [false];
            }
            let cardCode = type + num;
            return [true, cardCode];

        }else{
            return [false];
        }
    }

    clear() {
        this.initPokerBoard();
    }
}

module.exports = Room;