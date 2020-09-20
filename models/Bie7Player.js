const MongoDatabase = require('../database/mongodb');

class Bie7Player {
    constructor({userName, score, numWin, numGame, currentPokers, webSocket}) {
        this.userName = userName;
        this.score = score;
        this.numWin = numWin;
        this.numGame = numGame;
        this.currentPokers = currentPokers;
        this.kouPokers = [];
        this.webSocket = webSocket;
        this.isPrepared = false;
        this.myTurn = false;
        this.shouldKou = false;
        this.numKou = 0;
        this.isInGame = false;
    }

    setCurrentPokers(pokers) {
        this.currentPokers = pokers;
    }

    getWebSocket() {
        return this.webSocket;
    }

    setPrepareStatus(isPrepared) {
        this.isPrepared = isPrepared;
    }

    setMyTurn(isMyTurn) {
        this.myTurn = isMyTurn;
    }

    setShouldKou(shouldKou) {
        this.shouldKou = shouldKou;
    }

    setIsInGame(isInGame) {
        this.isInGame = isInGame;
    }

    updateDatabase() {
        MongoDatabase.getInstance().update({
            _id: this.userName,
            userName: this.userName
        }, {
            score: this.score,
            numWin: this.numWin,
            numGame: this.numGame
        }, 'user');
    }

    init() {
        this.currentPokers = [];
        this.kouPokers = [];
        this.myTurn = false;
        this.shouldKou = false;
        this.isPrepared = false;
        this.numKou = 0;
        this.isInGame = false;
    }

    calculateKouScore() {
        let score = 0;
        for(let poker of this.kouPokers) {
            score += poker.number;
        }
        return score;
    }

    addScore(score) {
        this.score += score;
        if(score >= 0)
            this.numWin += 1;
        this.numGame += 1;
    }

    serialize() {
        return {
            userName: this.userName,
            score: this.score,
            winRate: this.numGame!==0?this.numWin / this.numGame:0,
            isPrepared: this.isPrepared,
            myTurn: this.myTurn,
            shouldKou: this.shouldKou,
            numKou: this.numKou,
            isInGame: this.isInGame
        }
    }

    serializeWithPoker() {
        let data = this.serialize();
        data['myPokers'] = this.currentPokers;
        return data;
    }
}

module.exports = Bie7Player;