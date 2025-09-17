import { addCombatFunct, addTradeFunct } from "@/app/cardFunctions";
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct";
import { BaseType } from "@/app/classes/base";
import { BaseCardType } from "@/app/classes/card";

export const tradingPostFactoryFunction = (id: string, tradingPostData: BaseCardType) => {
    const tradingPost: BaseType = {
        ...tradingPostData,
        id,
        type: 'base',
        choice: ['trade', 'authority'],
        shield: 4,
        outpost: true,
        mainFunctionality: {
            requirement: ['choice'],
            execute: ({ player, context }) => {
                player.cardsPlayedThisTurn.push(tradingPost)
                const { choice } = context as { choice: string }
                if (choice === 'trade') {
                    addTradeFunct(player, 1)
                } else if (choice === 'authority') {
                    addAuthorityFunct(player, 1)
                }
            }
        },
        scrapFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 3)
            }
        }
    }
    return tradingPost
}
