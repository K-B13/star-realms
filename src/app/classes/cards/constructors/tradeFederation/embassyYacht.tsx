import { addTradeFunct } from "@/app/cardFunctions"
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const embassyYachtFactoryFunction = (id: number, embassyYachtData: BaseCardType) => {
    const embassyYacht: ShipType = {
        ...embassyYachtData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                player.factions['Trade Federation'] += 1
                addTradeFunct(player, 2)
                addAuthorityFunct(player, 3)
                if (player.bases.length >= 2) {
                    drawFunct(player, 2)
                }
            }
        }
    }
    return embassyYacht
}