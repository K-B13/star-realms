import { addCombatFunct } from "@/app/cardFunctions"
import scrapCardInTradeRowFunct from "@/app/cardFunctions/scrapCardInTradeRowFunct"
import { BaseCardType, CardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const missileBotFactoryFunction = (id: number, missileBotData: BaseCardType) => {
    const missileBot: ShipType = {
        ...missileBotData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: ['choice', 'playerCard'],
            execute: ({ player, context }) => {
                const { choice, playerCard, location, scrapPile } = context as { choice: string, playerCard: CardType, location: 'hand' | 'discard', scrapPile: CardType[] }
                addCombatFunct(player, 2)
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
    return missileBot
}