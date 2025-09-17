import { addCombatFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

const blobWorldFactoryFunction = (id: number, blobWorldData: BaseCardType) => {
    const blobWorld: BaseType = {
        ...blobWorldData,
        id,
        type: 'base',
        shield: 7,
        outpost: false,
        choice: ['combat', 'draw'],
        mainFunctionality: {
            requirement: ['choice'],
            execute: ({ player, context }) => {
                const { choice } = context as { choice: string }
                if (choice === 'combat') {
                    addCombatFunct(player, 5)
                } else if (choice === 'draw') {
                    drawFunct(player, player.factions["The Blob"])
                }
            }
        }
    }
    return blobWorld
}

export default blobWorldFactoryFunction
