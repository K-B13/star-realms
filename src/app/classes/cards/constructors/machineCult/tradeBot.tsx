import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions"
import scrapCardInTradeRowFunct from "@/app/cardFunctions/scrapCardInTradeRowFunct"
import { BaseCardType, CardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

const tradeBotFactoryFunction = (id: number, tradeBotData: BaseCardType) => {
    const tradeBot: ShipType = {
        ...tradeBotData,
        id,
        type: 'ship',
        choice: ['yes', 'no'],
        mainFunctionality: {
            requirement: ['choice', 'playerCard'],
            execute: ({ player, context }) => {
                const { choice, playerCard, location, scrapPile } = context as { choice: string, playerCard: CardType, location: 'hand' | 'discard', scrapPile: CardType[] }
                addTradeFunct(player, 1)
                if (choice === 'yes') {
                    player[location] = player[location].filter((card: CardType) => card.id !== playerCard.id)
                    scrapCardInTradeRowFunct(player, playerCard, scrapPile)
                }
                
            }
        },
        allyFunctionality: {
            requirement: [],
            execute: ({ player }) => {
                addCombatFunct(player, 2)
            }
        }
    }
    return tradeBot
}

export default tradeBotFactoryFunction
