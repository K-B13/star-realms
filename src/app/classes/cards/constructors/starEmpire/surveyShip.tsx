import { addTradeFunct } from "@/app/cardFunctions"
import discardOpponentsCardFunct from "@/app/cardFunctions/discardOpponentsCardFunct"
import { drawFunct } from "@/app/cardFunctions/drawFunct"
import { BaseCardType, CardType } from "@/app/classes/card"
import { PlayerType } from "@/app/classes/player"
import { ShipType } from "@/app/classes/ship"

export const surveyShipFactoryFunction = (id: number, surveyShipData: BaseCardType) => {
    const surveyShip: ShipType = {
        ...surveyShipData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                addTradeFunct(player, 1)
                drawFunct(player, 1)
            }
        },
        scrapFunctionality: {
            requirement: ['opponent', 'card'],
            execute: ({ player, context }) => {
                const { targetPlayer, card } = context as { targetPlayer: PlayerType, card: CardType }
                discardOpponentsCardFunct(targetPlayer, card)
            }
        }
    }  
    return surveyShip  
}
