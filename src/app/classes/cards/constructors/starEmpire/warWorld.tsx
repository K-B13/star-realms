import { addCombatFunct } from "@/app/cardFunctions"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

const warWorldFactoryFunction = (id: number, warWorldData: BaseCardType) => {
    const warWorld: BaseType = {
        ...warWorldData,
        id,
        type: 'base',
        shield: 4,
        outpost: true,
        mainFunctionality: {
            requirement: [],
            execute: ({ player }) => {
                addCombatFunct(player, 3)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 4)
            }
        }
    }
    return warWorld
}

export default warWorldFactoryFunction