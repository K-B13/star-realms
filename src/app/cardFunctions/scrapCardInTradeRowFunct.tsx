import { CardType } from "../classes/card"
import { PlayerType } from "../classes/player"

const scrapCardInTradeRowFunct = (player: PlayerType, card: CardType, scrapPile: CardType[]) => {
    scrapPile.push(card)
}

export default scrapCardInTradeRowFunct