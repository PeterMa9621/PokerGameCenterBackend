class Bie7Player {
    constructor(userName, score, winRate, currentPokers, webSocket) {
        this.userName = userName;
        this.score = score;
        this.winRate = winRate;
        this.currentPokers = currentPokers;
        this.webSocket = webSocket;
        this.isPrepared = false;
        this.myTurn = false;
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

    serialize() {
        return {
            userName: this.userName,
            score: this.score,
            winRate: this.winRate,
            isPrepared: this.isPrepared,
            myTurn: this.myTurn
        }
    }
}

module.exports = Bie7Player;