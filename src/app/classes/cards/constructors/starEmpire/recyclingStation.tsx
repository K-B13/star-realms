import { addTradeFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType, CardType } from "@/app/classes/card"
import { discardCard } from "@/app/classes/player"

export const recyclingStationFactoryFunction = (id: number, recyclingStationData: BaseCardType) => {
    const recyclingStation: BaseType = {
        ...recyclingStationData,
        id,
        type: 'base',
        shield: 4,
        outpost: true,
        choice: ['trade', 'discardDraw'],
        mainFunctionality: {
            requirement: ['choice', 'noCards'],
            execute: ({ player, context }) => {
                const { choice, noCards } = context as { choice: string, noCards: CardType[] }
                if (choice === 'trade') {
                    addTradeFunct(player, 1)
                } else if (choice === 'discardDraw') {
                    noCards.forEach(card => {
                        discardCard(player, card)
                    })
                    drawFunct(player, noCards.length)
                }
            }
        }
    }
    return recyclingStation
}