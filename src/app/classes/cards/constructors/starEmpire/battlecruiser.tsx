import { addCombatFunct } from "@/app/cardFunctions"
import destroyTargetBaseFunct from "@/app/cardFunctions/destroyTargetBaseFunct"
import discardOpponentsCardFunct from "@/app/cardFunctions/discardOpponentsCardFunct"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType, CardType } from "@/app/classes/card"
import { PlayerType } from "@/app/classes/player"
import { ShipType } from "@/app/classes/ship"

export const battlecruiserFactoryFunction = (id: number, battlecruiserData: BaseCardType) => {
    const battlecruiser: ShipType = {
        ...battlecruiserData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 5)
                drawFunct(player, 1)
            }
        },
        allyFunctionality: {
            requirement: ['opponent', 'card'],
            execute: ({ player, context }) => {
                const { targetPlayer, card } = context as { targetPlayer: PlayerType, card: CardType }
                discardOpponentsCardFunct(targetPlayer, card)
            }
        },
        scrapFunctionality: {
            requirement: ['base'],
            execute: ({ player, context }) => {
                drawFunct(player, 1)
                const { base } = context as { base: BaseType }
                if (base) {
                    destroyTargetBaseFunct(player, base)
                }
            }
        }
    }
    return battlecruiser
}