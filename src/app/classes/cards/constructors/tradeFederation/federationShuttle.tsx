import { addTradeFunct } from "@/app/cardFunctions"
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const federationShuttleFactoryFunction = (id: string) => {
    const federationShuttle: ShipType = {
        name: "Federation Shuttle",
        faction: "Trade Federation",
        cost: 1,
        id,
        mainDescription: "<img src='/images/coin.png' width=20rem height=20rem /><p> +2</p>",
        allyDescription: "<img src='/images/authority.svg' width=20rem height=20rem /><p> +4</p>",
        extraText: "Fast? This baby doesn't just haul cargo. She hauls...",
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