import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

export const blobWheelFactoryFunction = (id: number, blobWheelData: BaseCardType) => {
    const blobWheel: BaseType = {
        ...blobWheelData,
        id,
        type: 'base',
        shield: 5,
        outpost: false,
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 1)
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addTradeFunct(player, 3)
            }
        }
    }
    return blobWheel
}