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
        this.players = [null, null, null, null];
        this.currentPlayerIndex = 0;
        this.types = [PokerType.CLUB, PokerType.DIAMOND, PokerType.HEART, PokerType.SPADE];
        this.isGameStart = false;
        this.initPokerBoard();
    }

    initPokerBoard() {
        this.currentPokerBoard = {};
        for(let type of this.types) {
            this.currentPokerBoard[type] = [];
        }
        this.isGameStart = false;
        this.numPoker = 0;
    }

    canStartGame() {
        for(let player of this.players) {
            if(player===null)
                return false;
            if(!player.isPrepared)
                return false;
        }
        return true;
    }

    canPlayAnyPoker(player) {
        for(let poker of player.currentPokers) {
            if(this.checkValid(poker)[0])
                return true;
        }
        return false;
    }

    startGame() {
        this.clear();
        this.dealRandomPoker();
        this.isGameStart = true;
        this.sendAllPlayerData();
        this.sendMessageToAllPlayers(JSON.stringify({
            action: Bie7ActionType.START,
            currentPlayer: this.players[this.currentPlayerIndex].userName
        }));
    }

    canEndGame() {
        return this.numPoker === 52;
    }

    addPlayer(player) {
        if(this.players.length > 4)
            return;

        if(!this.hasOrderedPlayer(player.userName))
            this.players[this.players.indexOf(null)] = player;
        this.sendAllPlayerData();
    }

    hasOrderedPlayer(userName) {
        for(let player of this.players) {
            if(player === null)
                continue;
            if(player.userName === userName)
                return true;
        }
        return false;
    }

    getPlayer(userName) {
        for(let player of this.players) {
            if(player.userName === userName)
                return player;
        }
        return null;
    }

    removePlayer(userName) {
        for(let i=0; i<this.players.length; i++) {
            let player = this.players[i];
            if(player===null)
                continue;
            if(player.userName === userName) {
                this.players[i] = null;
                break;
            }
        }
        this.sendAllPlayerData();
    }

    sendAllPlayerData(action=Bie7ActionType.UPDATE_PLAYER) {
        this.sendMessageToAllPlayers(JSON.stringify({
            action: action,
            players: this.serializePlayers()
        }));
        if(!this.isGameStart)
            return;

        for(let player of this.players) {
            if(player === null)
                continue;
            player.getWebSocket().send(JSON.stringify({
                action: Bie7ActionType.UPDATE_POKER,
                poker: player.currentPokers
            }));
        }
    }

    sendMessageToAllPlayers(msg) {
        for(let player of this.players) {
            if(player!==null) {
                if(player.getWebSocket().readyState === 1)
                    player.getWebSocket().send(msg);
            }
        }
    }

    serializePlayers() {
        let players = [];
        for(let player of this.players) {
            if(player===null)
                players.push(null);
            else
                players.push(player.serialize());
        }
        return players;
    }

    nextTurn() {
        let prevPlayer = this.players[this.currentPlayerIndex];
        prevPlayer.setMyTurn(false);
        prevPlayer.setShouldKou(false);
        this.currentPlayerIndex += 1;
        this.currentPlayerIndex %= 4;
        let currentPlayer = this.players[this.currentPlayerIndex];
        currentPlayer.setMyTurn(true);
        if(!this.canPlayAnyPoker(currentPlayer))
            currentPlayer.setShouldKou(true);
        this.sendAllPlayerData();
    }

    dealRandomPoker() {
        let players = this.players;
        let numPlayer = players.length;
        if(numPlayer !== 4) {
            throw "Number of player is not 4!";
        }
        let randomPokers = this.dealCards();
        let index = 0;
        for(let i=0; i<numPlayer; i++) {
            players[i].setIsInGame(true);
            if(randomPokers[i][0] === 'S7') {
                console.log(players[i].userName + " has S7");
                this.currentPlayerIndex = i;
                players[i].setMyTurn(true);
            }
            let pokerList = PokerUtility.convertPokerCodesToPokerList(randomPokers[index]);
            players[i].setCurrentPokers(pokerList);
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

    kouPoker(userName, poker) {
        this.removePlayerPoker(userName, poker);
        let player = this.getPlayer(userName);
        player.numKou ++;
        player.kouPokers.push(poker);
    }

    removePlayerPoker(userName, poker) {
        let player = this.getPlayer(userName);
        for(let i=0; i<Object.keys(player.currentPokers).length; i++) {
            let currentPoker = player.currentPokers[i];
            if(currentPoker.pokerType === poker.pokerType && currentPoker.number === poker.number) {
                player.currentPokers.splice(i, 1);
                break;
            }
        }
        this.numPoker ++;
    }

    playPoker(poker, pokerCode) {
        this.currentPokerBoard[poker.pokerType].push(pokerCode);
    }

    checkValid(card){
        let result;
        switch (card.pokerType) {
            case PokerType.CLUB:
                result = this.isValid(card.number,'C',this.currentPokerBoard[PokerType.CLUB]);
                break;
            case PokerType.DIAMOND:
                result = this.isValid(card.number,'D',this.currentPokerBoard[PokerType.DIAMOND]);
                break;
            case PokerType.HEART:
                result = this.isValid(card.number,'H',this.currentPokerBoard[PokerType.HEART]);
                break;
            case PokerType.SPADE:
                result = this.isValid(card.number,'S',this.currentPokerBoard[PokerType.SPADE]);
                break;
            default:
                result = [false];
        }
        return result;
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

    getNumberPlayer() {
        let count = 0;
        for(let player of this.players) {
            if(player!==null)
                count ++;
        }
        return count;
    }

    initPlayers() {
        for(let player of this.players) {
            if(player!==null)
                player.init();
        }
    }

    endGame() {
        this.calculateScore();
        for(let player of this.players) {
            player.setIsInGame(false);
            player.setMyTurn(false);
            player.setPrepareStatus(false);
            player.setShouldKou(false);
        }

        this.sendAllPlayerData();
    }

    calculateScore() {
        let kouScore = [];
        for(let player of this.players) {
            kouScore.push(player.calculateKouScore());
        }
        console.log(kouScore);

        for(let i=0; i<kouScore.length; i++) {
            let player = this.players[i];
            let score = 0;
            for(let j=0; j<kouScore.length; j++) {
                if(j === i)
                    continue;
                score += kouScore[j] - kouScore[i];
            }
            player.addScore(score);
            player.updateDatabase();
        }
    }

    clear() {
        this.initPokerBoard();
        this.initPlayers();
        this.sendAllPlayerData();
    }
}

module.exports = Room;