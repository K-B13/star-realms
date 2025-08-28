import { CardType } from "../classes/card"
import { discardCard, PlayerType } from "../classes/player"

const discardOpponentsCardFunct = (player: PlayerType, card: CardType) => {
    discardCard(player, card)
}

export default discardOpponentsCardFunct