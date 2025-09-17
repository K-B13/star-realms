import { addTradeFunct } from "@/app/cardFunctions"
import destroyTargetBaseFunct from "@/app/cardFunctions/destroyTargetBaseFunct"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

export const portOfCallFactoryFunction = (id: string, portOfCallData: BaseCardType) => {
    const portOfCall: BaseType = {
        ...portOfCallData,
        id,
        type: 'base',
        shield: 6,
        outpost: true,
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addTradeFunct(player, 3)
            }
        },
        scrapFunctionality: {
            requirement: ['base'],
            execute: ({ player, context }) => {
                drawFunct(player, 1)
                if (context) {
                    const { base } = context as { base: BaseType }
                    destroyTargetBaseFunct(player, base)
                }
            }
        }
    }
    return portOfCall
}