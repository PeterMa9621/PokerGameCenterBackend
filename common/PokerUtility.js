const Poker = require("../models/Poker");
const PokerType = require("./PokerType");

class PokerUtility {
    static convertPokerCodesToPokerList(list) {
        let result = [];
        console.log(list);
        for(let code of list) {
            let type = '';
            let typeCode = code.substring(0, 1);
            switch (typeCode) {
                case 'C':
                    type = PokerType.CLUB;
                    break;
                case 'D':
                    type = PokerType.DIAMOND;
                    break;
                case 'H':
                    type = PokerType.HEART;
                    break;
                case 'S':
                    type = PokerType.SPADE;
                    break;
            }
            let number = parseInt(code.substring(1));
            console.log(typeCode, number);
            result.push(new Poker(type, number));
        }
        result = this.orderPoker(result);
        return result;
    }

    static orderPoker(list) {
        return list.sort((a, b) => (a.number < b.number) ? 1 : -1);
    }
}

module.exports = PokerUtility;