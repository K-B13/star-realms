import { addTradeFunct } from "@/app/cardFunctions";
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct";
import { BaseCardType } from "@/app/classes/card";
import { addAuthority } from "@/app/classes/player";
import { ShipType } from "@/app/classes/ship";

export const cutterFactoryFunction = (id: number, cutterData: BaseCardType) => {
    const cutter: ShipType = {
        ...cutterData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                player.factions['Trade Federation'] += 1
                addTradeFunct(player, 2)
                addAuthority(player, 4)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addAuthorityFunct(player, 4)
            }
        }
    }
    return cutter
}