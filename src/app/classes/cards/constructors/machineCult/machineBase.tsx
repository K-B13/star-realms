import { drawFunct } from "@/app/cardFunctions/drawFunct"
import scrapCardInTradeRowFunct from "@/app/cardFunctions/scrapCardInTradeRowFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType, CardType } from "@/app/classes/card"

const machineBaseFactoryFunction = (id: number, machineBaseData: BaseCardType) => {
    const machineBase: BaseType = {
        ...machineBaseData,
        id,
        type: 'base',
        shield: 6,
        outpost: true,
        mainFunctionality: {
            requirement: ['call', 'playerCard'],
            execute: ({ player, context }) => {
                const { call, playerCard, location, scrapPile } = context as { call: string, playerCard: CardType, location: 'hand' | 'discard', scrapPile: CardType[] }
                if (call === 'hasPlayerCard') {
                    player[location] = player[location].filter((card: CardType) => card.id !== playerCard.id)
                    scrapCardInTradeRowFunct(player, playerCard, scrapPile)
                } else {
                    drawFunct(player, 1)
                    return ['response']
                }
            }
        }
    }
    return machineBase
}

export default machineBaseFactoryFunction
