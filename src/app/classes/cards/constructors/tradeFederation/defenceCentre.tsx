import { addCombatFunct } from "@/app/cardFunctions";
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct";
import { BaseType } from "@/app/classes/base";
import { BaseCardType } from "@/app/classes/card";

export const defenceCentreFactoryFunction = (id: number, defenceCentreData: BaseCardType) => {
    const defenceCentre: BaseType = {
        ...defenceCentreData,
        id,
        type: 'base',
        shield: 5,
        choice: ['authority', 'combat'],
        outpost: true,
        mainFunctionality: {
            requirement: ['choice'],
            execute: ({ player, context }) => {
                const { choice } = context as { choice: string }
                if (choice === 'authority') {
                    addAuthorityFunct(player, 3)
                } else if (choice === 'combat') {
                    addCombatFunct(player, 2)
                }
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 2)
            }
        }
    }
    return defenceCentre
}