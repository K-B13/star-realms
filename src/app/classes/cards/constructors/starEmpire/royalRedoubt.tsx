import { addCombatFunct } from "@/app/cardFunctions"
import discardOpponentsCardFunct from "@/app/cardFunctions/discardOpponentsCardFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType, CardType } from "@/app/classes/card"
import { PlayerType } from "@/app/classes/player"

const royalRedoubtFactoryFunction = (id: number, royalRedoubtData: BaseCardType) => {
    const royalRedoubt: BaseType = {
        ...royalRedoubtData,
        id,
        type: 'base',
        shield: 6,
        outpost: true,
        mainFunctionality: {
            requirement: [],
            execute: ({ player }) => {
                addCombatFunct(player, 3)
            }
        },
        allyFunctionality: {
            requirement: ['opponent', 'card'],
            execute: ({ player, context }) => {
                const { targetPlayer, card } = context as { targetPlayer: PlayerType, card: CardType }
                discardOpponentsCardFunct(targetPlayer, card)
            }
        }
    }
    return royalRedoubt
}

export default royalRedoubtFactoryFunction