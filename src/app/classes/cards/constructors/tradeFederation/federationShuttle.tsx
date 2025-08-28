import { addTradeFunct } from "@/app/cardFunctions"
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const federationShuttleFactoryFunction = (id: number, federationShuttleData: BaseCardType) => {
    const federationShuttle: ShipType = {
        ...federationShuttleData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                player.factions['Trade Federation'] += 1
                addTradeFunct(player, 2)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addAuthorityFunct(player, 4)
            }
        }
    }
    return federationShuttle
}