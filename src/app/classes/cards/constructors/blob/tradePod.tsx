import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const tradePodFactoryFunction = (id: number, tradePodData: BaseCardType) => {
    const tradePod: ShipType = {
        ...tradePodData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addTradeFunct(player, 3)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 2)
            }
        }
    }
    return tradePod
}