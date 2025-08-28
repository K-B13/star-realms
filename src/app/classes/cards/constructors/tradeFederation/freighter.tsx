import { addTradeFunct } from "@/app/cardFunctions";
import { BaseCardType } from "@/app/classes/card";
import { ShipType } from "@/app/classes/ship";

export const freighterFactoryFunction = (id: number, freighterData: BaseCardType) => {
    const freighter: ShipType = {
        ...freighterData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                player.factions['Trade Federation'] += 1
                addTradeFunct(player, 4)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                player.nextCardLocation = 'deck'   
            }
        }
    }
    return freighter
}
