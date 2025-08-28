import { addCombatFunct } from "@/app/cardFunctions";
import destroyTargetBaseFunct from "@/app/cardFunctions/destroyTargetBaseFunct";
import scrapCardInTradeRowFunct from "@/app/cardFunctions/scrapCardInTradeRowFunct";
import { BaseType } from "@/app/classes/base";
import { BaseCardType, CardType } from "@/app/classes/card";
import { ShipType } from "@/app/classes/ship";

export const blobDestroyerFactoryFunction = (id: number, blobDestroyerData: BaseCardType) => {
    const blobDestroyer: ShipType = {
        ...blobDestroyerData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 6)
            }
        },
        allyFunctionality: {
            requirement: ['base', 'scrapTradeRow'],
            execute: ({ player, context }) => {
                if (!context) return
                const { base, scrapPile } = context as { base: BaseType, scrapPile: CardType[] }
                if (scrapPile) {
                    scrapCardInTradeRowFunct(player, base, scrapPile)
                }
                if (base) {
                    destroyTargetBaseFunct(player, base)
                }
            }
        }
    }
    return blobDestroyer
}