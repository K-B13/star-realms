import { addCombatFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

const battleBlobFactoryFunction = (id: number, battleBlobData: BaseCardType) => {
    const battleBlob: ShipType = {
        ...battleBlobData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 8)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 4)
            }
        }
    }
    return battleBlob
}

export default battleBlobFactoryFunction