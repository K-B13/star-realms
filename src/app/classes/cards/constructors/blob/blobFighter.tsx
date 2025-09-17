import { addCombatFunct } from "@/app/cardFunctions";
import { drawFunct } from "@/app/cardFunctions/drawFunct";
import { BaseCardType } from "@/app/classes/card";
import { ShipType } from "@/app/classes/ship";

const blobFighterFactoryFunction = (id: number, blobFighterData: BaseCardType) => {
    const blobFighter: ShipType = {
        ...blobFighterData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 3)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        }
    }
    return blobFighter
}

export default blobFighterFactoryFunction
