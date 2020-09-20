const Bie7Container = require("../../common/Bie7Container");
const Bie7ActionType = require("../../common/Bie7ActionType");
const Bie7Player = require("../../models/Bie7Player");
const MongoDatabase = require('../../database/mongodb');

class PokerController {
    static async initPlayerConnection(roomId, userName, webSocket) {
        let room = Bie7Container.getRoom(roomId);
        let user = await MongoDatabase.getInstance().findOne({userName: userName}, 'user');

        let player = new Bie7Player({
            ...user,
            currentPokers: [],
            webSocket: webSocket
        });
        room.addPlayer(player);
    }

    static removePlayerConnection(roomId, userName) {
        let room = Bie7Container.getRoom(roomId);
        room.removePlayer(userName);
    }

    static doAction(msg) {
        let data = JSON.parse(msg);
        if(!('action' in data))
            return;
        if(!('roomId' in data))
            return;
        if(!('userName' in data))
            return;
        let action = data['action'];
        let roomId = data['roomId'];
        let userName = data['userName'];
        let poker = data['poker'];
        let room = Bie7Container.getRoom(roomId);
        switch (action) {
            case Bie7ActionType.PREPARE:
                room.getPlayer(userName).setPrepareStatus(true);
                room.sendAllPlayerData();
                if(room.canStartGame()) {
                    room.startGame();
                }
                break;
            case Bie7ActionType.NOT_PREPARE:
                room.getPlayer(userName).setPrepareStatus(false);
                room.sendAllPlayerData();
                break;
            case Bie7ActionType.PLAY_CARD:
                let validResult = room.checkValid(poker);
                if (!validResult[0]){
                    room.getPlayer(userName).getWebSocket().send(JSON.stringify({
                        action: 'error',
                        msg: '您出的牌不符合规则'
                    }));
                } else {
                    room.removePlayerPoker(userName, poker);
                    room.playPoker(poker, validResult[1]);
                    room.sendMessageToAllPlayers(JSON.stringify({
                        action: 'play card',
                        poker: poker,
                        userName: userName
                    }));
                    if(room.canEndGame()) {
                        room.endGame();
                        return;
                    }
                    room.nextTurn();
                }
                break;
            case Bie7ActionType.KOU_CARD:
                room.kouPoker(userName, poker);

                room.sendMessageToAllPlayers(JSON.stringify({
                    action: 'kou card',
                    userName: userName
                }));
                if(room.canEndGame()) {
                    room.endGame();
                    return;
                }
                room.nextTurn();
        }
    }

    static clearBoard(roomId){
        let room = Bie7Container.getRoom(roomId);
        room.clear();
        room.sendMessageToAllPlayers(JSON.stringify({
            action: 'clear',
        }));
    }
}

module.exports = PokerController;