const Bie7Container = require("../../common/Bie7Container");
const Bie7ActionType = require("../../common/Bie7ActionType");
const Bie7Player = require("../../models/Bie7Player");

class PokerController {
    static initPlayerConnection(roomId, userName, webSocket) {
        let room = Bie7Container.getRoom(roomId);
        let player = new Bie7Player(userName, 0, 0, [], webSocket);
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
        let card = data['poker'];
        let room = Bie7Container.getRoom(roomId);
        switch (action) {
            case Bie7ActionType.JOIN:
                break;
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
                if (! room.checkValid(card)){
                    room.sendMessageToAllPlayers('{"error":false}');
                }
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