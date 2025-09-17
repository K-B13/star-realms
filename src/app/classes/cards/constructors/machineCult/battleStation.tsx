import { addCombatFunct } from "@/app/cardFunctions"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

const battleStationFactoryFunction = (id: number, battleStationData: BaseCardType) => {
    const battleStation: BaseType = {
        ...battleStationData,
        id,
        type: 'base',
        shield: 5,
        outpost: true,
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                return
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 5)
            }
        }
    }
    return battleStation
}

export default battleStationFactoryFunction
