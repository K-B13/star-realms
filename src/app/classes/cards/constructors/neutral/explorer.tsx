import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions"
import { PlayerType } from "../../../player"
import { ShipType } from "../../../ship"
import { BaseCardType } from "@/app/classes/card"

export const explorerFactoryFunction = (id: number, explorerData: BaseCardType) => {
    const explorer: ShipType = {
        ...explorerData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: (player: PlayerType) => {
                addTradeFunct(player, 2)
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: (player: PlayerType) => {
                addCombatFunct(player, 2)
            }
        }
    }
    return explorer
}
