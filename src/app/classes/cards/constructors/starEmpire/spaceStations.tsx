import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

const spaceStationFactoryFunction = (id: number, spaceStationData: BaseCardType) => {
    const spaceStation: BaseType = {
        ...spaceStationData,
        id,
        type: 'base',
        shield: 4,
        outpost: true,
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 2)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 2)
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addTradeFunct(player, 4)
            }
        }
    }
    return spaceStation
}

export default spaceStationFactoryFunction