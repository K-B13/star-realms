import { addCombatFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const mothershipFactoryFunction = (id: number, mothershipData: BaseCardType) => {
    const mothership: ShipType = {
        ...mothershipData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 6)
                drawFunct(player, 1)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        }
    }
    return mothership
}