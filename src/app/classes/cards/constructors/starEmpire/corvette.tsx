import { addCombatFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

const corvetteFactoryFunction = (id: number, corvetteData: BaseCardType) => {
    const corvette: ShipType = {
        ...corvetteData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 1)
                drawFunct(player, 1)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 2)
            }
        }
    }
    return corvette
}

export default corvetteFactoryFunction