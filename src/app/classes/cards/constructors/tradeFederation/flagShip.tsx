import { addCombatFunct } from "@/app/cardFunctions"
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const flagShipFactoryFunction = (id: number, flagShipData: BaseCardType) => {
    const flagShip: ShipType = {
        ...flagShipData,
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
            requirement: [''],
            execute: ({ player }) => {
                addAuthorityFunct(player, 5)
            }
        }
    }
    return flagShip
}