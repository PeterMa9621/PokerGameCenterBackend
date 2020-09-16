const Room = require("../models/Room");

class Bie7Container {
    static Bie7Rooms = {};

    static getRooms() {
        return this.Bie7Rooms;
    }

    static getRoomsInfo() {
        let data = {};
        for(let roomId in this.Bie7Rooms) {
            let room = this.Bie7Rooms[roomId];
            data[roomId] = {
                numPlayers: Object.keys(room.players).length
            }
        }
        return data;
    }

    static getRoom(id) {
        if(!(id in this.Bie7Rooms)) {
            this.Bie7Rooms[id] = new Room(id);
        }
        return this.Bie7Rooms[id];
    }

    static destroyRoom(id) {
        delete this.Bie7Rooms[id];
    }
}

module.exports = Bie7Container;