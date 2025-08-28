import { addTradeFunct } from "@/app/cardFunctions"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

export const centralOfficeFactoryFunction = (id: number, centralOfficeData: BaseCardType) => {
    const centralOffice: BaseType = {
        ...centralOfficeData,
        id,
        type: 'base',
        shield: 6,
        outpost: false,
        choice: ['yes', 'no'],
        mainFunctionality: {
            requirement: ['choice'],
            execute: ({ player, context }) => {
                addTradeFunct(player, 2)
                const { choice } = context as { choice: string }
                if (choice === 'yes') {
                    player.nextCardLocation = 'deck'   
                }
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                drawFunct(player, 1)
            }
        }
    }
    return centralOffice
}