const Bie7ActionType = require("../common/Bie7ActionType");
const Bie7Container = require("../common/Bie7Container");
const PokerUtility = require("../common/PokerUtility");

const cardC = ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12','C13'];
const cardD = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13'];
const cardH = ['H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H11','H12','H13'];
const cardS = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13'];

class Room {
    constructor(id) {
        this.id = id;
        this.players = {};
        this.currentPokerBoard = {};
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
        this.sendAllPlayerData();
    }

    getPlayer(userName) {
        return this.players[userName];
    }

    removePlayer(userName) {
        delete this.players[userName];

        this.sendAllPlayerData();
    }

    sendAllPlayerData() {
        this.sendMessageToAllPlayers(JSON.stringify({
            action: Bie7ActionType.JOIN,
            players: this.serializePlayers()
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

    dealRandomPoker() {
        let players = this.players;
        let numPlayer = Object.keys(players).length;
        if(numPlayer !== 4) {
            throw "Number of player is not 4!";
        }
        let randomPokers = this.dealCards();
        let index = 0;
        for(let userName in players) {
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
}

module.exports = Room;