import { addCombatFunct } from "@/app/cardFunctions";
import { addAuthorityFunct } from "@/app/cardFunctions/addAuthorityFunct";
import destroyTargetBaseFunct from "@/app/cardFunctions/destroyTargetBaseFunct";
import { drawFunct } from "@/app/cardFunctions/drawFunct";
import { BaseType } from "@/app/classes/base";
import { BaseCardType } from "@/app/classes/card";
import { ShipType } from "@/app/classes/ship";

export const commandShipFactoryFunction = (id: string, commandShipData: BaseCardType) => {
    const commandShip: ShipType = {
        ...commandShipData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                player.factions['Trade Federation'] += 1
                addAuthorityFunct(player, 4)
                addCombatFunct(player, 5)
                drawFunct(player, 2)
            }
        },
        allyFunctionality: {
            requirement: ['base'],
            execute: ({ player, context }) => {
                if (context) {
                    const { base } = context as { base: BaseType }
                    destroyTargetBaseFunct(player, base)
                }
            }
        }
    }
    return commandShip
}