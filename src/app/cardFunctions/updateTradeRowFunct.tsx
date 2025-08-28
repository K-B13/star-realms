import { CardType } from "../classes/card";
import { PlayerType } from "../classes/player";

const updateTradeRowFunct = (player: PlayerType, card: CardType, tradeRow: CardType[]) => {
    const newTradeRow = tradeRow.filter((tradeRowItem) => tradeRowItem.id !== card.id)
    return newTradeRow
}

export default updateTradeRowFunct
