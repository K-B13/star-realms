import { addCombatFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import scrapCardInTradeRowFunct from "@/app/cardFunctions/scrapCardInTradeRowFunct"
import { BaseCardType, CardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

const battleMechFactoryFunction = (id: number, battleMechData: BaseCardType) => {
    const battleMech: ShipType = {
        ...battleMechData,
        id,
        type: 'ship',
        choice: ['yes', 'no'],
        mainFunctionality: {
            requirement: ['choice', 'playerCard'],
            execute: ({ player, context }) => {
                const { choice, playerCard, location, scrapPile } = context as { choice: string, playerCard: CardType, location: 'hand' | 'discard', scrapPile: CardType[] }
                addCombatFunct(player, 4)
                if (choice === 'yes') {
                    player[location] = player[location].filter((card: CardType) => card.id !== playerCard.id)
                    scrapCardInTradeRowFunct(player, playerCard, scrapPile)
                }
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        }
    }
    return battleMech
}

export default battleMechFactoryFunction