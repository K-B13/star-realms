import { addCombatFunct } from "@/app/cardFunctions"
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const tradeEscortFactoryFunction = (id: string, tradeEscortData: BaseCardType) => {
    const tradeEscort: ShipType = {
        ...tradeEscortData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                player.factions['Trade Federation'] += 1
                addAuthorityFunct(player, 4)
                addCombatFunct(player, 4)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        }
    }
    return tradeEscort
}