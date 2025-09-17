import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions"
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

export const barterWorldFactoryFunction = (id: string, barterWorldData: BaseCardType) => {
    const barterWorld: BaseType = {
        ...barterWorldData,
        id,
        type: 'base',
        shield: 4,
        choice: ['trade', 'authority'],
        outpost: false,
        mainFunctionality: {
            requirement: ['choice'],
            execute: ({ player, context }) => {
                const { choice } = context as { choice: string }
                if (choice === 'trade') {
                    addTradeFunct(player, 2)
                } else if (choice === 'authority') {
                    addAuthorityFunct(player, 2)
                }
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 5)
            }
        }
    }
    return barterWorld
}