import { CardType } from "../classes/card"
import { cardAcquisition, PlayerType } from "../classes/player"

const acquireFreeTradeRowCardFunct = (player: PlayerType, card: CardType) => {
    cardAcquisition(player, card, true)
}

export default acquireFreeTradeRowCardFunct
