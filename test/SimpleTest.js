const Bie7Player = require("../models/Bie7Player");
const Bie7Container = require( "../common/Bie7Container");
const PokerController = require( "../controller/bie7/PokerController");

class SimpleTest {
    test() {
        let player1 = new Bie7Player(1, 0, 0, []);
        let player2 = new Bie7Player(2, 0, 0, []);
        let player3 = new Bie7Player(3, 0, 0, []);
        let player4 = new Bie7Player(4, 0, 0, []);

        let room = Bie7Container.getRoom(1);
        room.addPlayer(player1);
        room.addPlayer(player2);
        room.addPlayer(player3);
        room.addPlayer(player4);

        PokerController.dealRandomPoker(1);
    }
}

module.exports = SimpleTest;
