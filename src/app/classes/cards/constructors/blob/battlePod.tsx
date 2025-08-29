import { addCombatFunct } from "@/app/cardFunctions";
import scrapCardInTradeRowFunct from "@/app/cardFunctions/scrapCardInTradeRowFunct";
import { BaseCardType, CardType } from "@/app/classes/card";
import { ShipType } from "@/app/classes/ship";

export const battlePodFactoryFunction = (id: number, battlePodData: BaseCardType) => {
    const battlePod: ShipType = {
        ...battlePodData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: ['yes', 'scrapTradeRow'],
            execute: ({ player, context }) => {
                if (context) {
                    const { card, scrapPile } = context as { card: CardType, scrapPile: CardType[] }
                    scrapCardInTradeRowFunct(player, card, scrapPile)
                }
                addCombatFunct(player, 4)
            }
        },
        allyFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 2)
            }
        }
    }
    return battlePod
}