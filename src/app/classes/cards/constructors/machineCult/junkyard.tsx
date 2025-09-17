import scrapCardInTradeRowFunct from "@/app/cardFunctions/scrapCardInTradeRowFunct";
import { BaseType } from "@/app/classes/base";
import { BaseCardType, CardType } from "@/app/classes/card";

const junkyardFactoryFunction = (id: number, junkyardData: BaseCardType) => {
    const junkyard: BaseType = {
        ...junkyardData,
        id,
        type: 'base',
        shield: 5,
        outpost: true,
        mainFunctionality: {
            requirement: ['playerCard'],
            execute: ({ player, context }) => {
                const { playerCard, location, scrapPile } = context as { playerCard: CardType, location: 'hand' | 'discard', scrapPile: CardType[] }
                player[location] = player[location].filter((card: CardType) => card.id !== playerCard.id)
                scrapCardInTradeRowFunct(player, playerCard, scrapPile)
            }
        }
    }
    return junkyard
}

export default junkyardFactoryFunction
