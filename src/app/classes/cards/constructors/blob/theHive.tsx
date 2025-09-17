import { addCombatFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

const theHiveFactoryFunction = (id: number, theHiveData: BaseCardType) => {
    const theHive: BaseType = {
        ...theHiveData,
        id,
        type: 'base',
        shield: 5,
        outpost: false,
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 3)
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        }
    }
    return theHive
}

export default theHiveFactoryFunction
