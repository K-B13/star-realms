import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions"
import scrapCardInTradeRowFunct from "@/app/cardFunctions/scrapCardInTradeRowFunct"
import { BaseCardType, CardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

const patrolMechFactoryFunction = (id: number, patrolMechData: BaseCardType) => {
    const patrolMech: ShipType = {
        ...patrolMechData,
        id,
        type: 'ship',
        choice: ['trade', 'combat'],
        mainFunctionality: {
            requirement: ['choice'],
            execute: ({ player, context }) => {
                const { choice } = context as { choice: string }
                if (choice === 'trade') {
                    addTradeFunct(player, 3)
                } else if (choice === 'combat') {
                    addCombatFunct(player, 5)
                }
            }
        },
        allyFunctionality: {
            // May need to refactor other yesNoChoices
            requirement: ['yesNoChoice', 'playerCard'],
            execute: ({ player, context }) => {
                const { choice, playerCard, location, scrapPile } = context as { choice: string, playerCard: CardType, location: 'hand' | 'discard', scrapPile: CardType[] }
                if (choice === 'yes') {
                    player[location] = player[location].filter((card: CardType) => card.id !== playerCard.id)
                    scrapCardInTradeRowFunct(player, playerCard, scrapPile)
                }
            }
        }
    }
    return patrolMech
}

export default patrolMechFactoryFunction