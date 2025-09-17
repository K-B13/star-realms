import { addCombatFunct } from "@/app/cardFunctions"
import discardOpponentsCardFunct from "@/app/cardFunctions/discardOpponentsCardFunct"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType, CardType } from "@/app/classes/card"
import { PlayerType } from "@/app/classes/player"
import { ShipType } from "@/app/classes/ship"

const imperialFrigateFactoryFunction = (id: number, imperialFrigateData: BaseCardType) => {
    const imperialFrigate: ShipType = {
        ...imperialFrigateData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: ['opponent', 'card'],
            execute: ({ player, context }) => {
                addCombatFunct(player, 4)
                const { targetPlayer, card } = context as { targetPlayer: PlayerType, card: CardType }
                discardOpponentsCardFunct(targetPlayer, card)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 2)
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        }
    }
    return imperialFrigate
}

export default imperialFrigateFactoryFunction