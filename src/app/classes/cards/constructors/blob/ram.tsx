import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions";
import { BaseCardType } from "@/app/classes/card";
import { ShipType } from "@/app/classes/ship";

const ramFactoryFunction = (id: number, ramData: BaseCardType) => {
    const ram: ShipType = {
        ...ramData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 5)
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
                addTradeFunct(player, 3)
            }
        }
    }
    return ram
}

export default ramFactoryFunction
