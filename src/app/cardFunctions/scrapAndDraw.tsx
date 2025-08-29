import { CardType } from "../classes/card";
import { drawCard, PlayerType } from "../classes/player";

export type cardToScrapType = {
    card: CardType,
    location: 'hand' | 'discard'
}

const scrapAndDraw = (player: PlayerType, cardToScrap: cardToScrapType, scrapPile: CardType[]) => {
    const { card, location } = cardToScrap
    scrapPile.push(card)
    player[location] = player[location].filter((item: CardType) => item.id !== card.id)
    drawCard(player)
}

export default scrapAndDraw