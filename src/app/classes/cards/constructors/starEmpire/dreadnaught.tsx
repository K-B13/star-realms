import { addCombatFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const dreadnaughtFactoryFunction = (id: number, dreadnaughtData: BaseCardType) => {
    const dreadnaught: ShipType = {
        ...dreadnaughtData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 7)
                drawFunct(player, 1)
            }
        },
        scrapFunctionality: {
            requirement: ['base'],
            execute: ({ player }) => {
                addCombatFunct(player, 5)
            }
        }
    }
    return dreadnaught
}