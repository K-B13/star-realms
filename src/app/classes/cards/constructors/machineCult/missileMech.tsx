import { addCombatFunct } from "@/app/cardFunctions"
import destroyTargetBaseFunct from "@/app/cardFunctions/destroyTargetBaseFunct"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

const missileMechFactoryFunction = (id: number, missileMechData: BaseCardType) => {
    const missileMech: ShipType = {
        ...missileMechData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: ['base'],
            execute: ({ player, context }) => {
                addCombatFunct(player, 6)
                const { base } = context as { base: BaseType }
                destroyTargetBaseFunct(player, base)
            }
        },
        allyFunctionality: {
            requirement: [],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        }
    }
    return missileMech
}

export default missileMechFactoryFunction
