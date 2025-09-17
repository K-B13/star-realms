import { addTradeFunct } from "@/app/cardFunctions"
import { PlayerType } from "../../../player"
import { ShipType } from "../../../ship"
import { BaseCardType } from "@/app/classes/card"

export const scoutFactoryFunction = (id: number, scoutData: BaseCardType) => {
    const scout: ShipType = {
        ...scoutData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addTradeFunct(player, 1)
            }
        }
    }
    return scout
}

export default scoutFactoryFunction