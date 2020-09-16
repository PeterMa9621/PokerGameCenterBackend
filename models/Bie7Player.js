class Bie7Player {
    constructor(userName, score, winRate, currentPokers, webSocket) {
        this.userName = userName;
        this.score = score;
        this.winRate = winRate;
        this.currentPokers = currentPokers;
        this.webSocket = webSocket;
        this.isPrepared = false;
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

    serialize() {
        return {
            userName: this.userName,
            score: this.score,
            winRate: this.winRate,
            isPrepared: this.isPrepared
        }
    }
}

module.exports = Bie7Player;