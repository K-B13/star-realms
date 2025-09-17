import { addCombatFunct } from "@/app/cardFunctions"
import discardOpponentsCardFunct from "@/app/cardFunctions/discardOpponentsCardFunct"
import { BaseCardType, CardType } from "@/app/classes/card"
import { PlayerType } from "@/app/classes/player"
import { ShipType } from "@/app/classes/ship"

const imperialFighterFactoryFunction = (id: number, imperialFighterData: BaseCardType) => {
    const imperialFighter: ShipType = {
        ...imperialFighterData,
        id,
        type: 'ship',
        mainFunctionality: {
            requirement: ['opponent', 'card'],
            execute: ({ player, context }) => {
                addCombatFunct(player, 2)
                const { targetPlayer, card } = context as { targetPlayer: PlayerType, card: CardType }
                discardOpponentsCardFunct(targetPlayer, card)
            }
        }
    }
    return imperialFighter
}

export default imperialFighterFactoryFunction