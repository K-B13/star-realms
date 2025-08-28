import { addCombatFunct } from "@/app/cardFunctions"
import acquireFreeTradeRowCardFunct from "@/app/cardFunctions/acquireFreeTradeRowCardFunct"
import { BaseCardType } from "@/app/classes/card"
import { ShipType } from "@/app/classes/ship"

export const blobCarrierFactoryFunction = (id: number, blobCarrierData: BaseCardType) => {
    const blobCarrier: ShipType = {
        ...blobCarrierData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addCombatFunct(player, 7)
            }
        },
        allyFunctionality: {
            requirement: ['ship'],
            execute: ({ player, context }) => {
                const { ship } = context as { ship: ShipType }
                player.nextCardLocation = 'deck'
                acquireFreeTradeRowCardFunct(player, ship)
            }
        }
    }
    return blobCarrier
}