import { addCombatFunct } from "@/app/cardFunctions";
import { BaseCardType } from "@/app/classes/card";
import { PlayerType } from "@/app/classes/player";
import { ShipType } from "@/app/classes/ship";

export const viperFactoryFunction = (id: number, viperData: BaseCardType) => {
    const viper: ShipType = {
        ...viperData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: (player: PlayerType) => {
                addCombatFunct(player, 1)
            }
        }
    }
    return viper
}