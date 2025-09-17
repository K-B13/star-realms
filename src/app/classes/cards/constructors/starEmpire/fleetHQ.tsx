import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

const fleetHQFactoryFunction = (id: number, fleetHQData: BaseCardType) => {
    const fleetHQ: BaseType = {
        ...fleetHQData,
        id,
        type: 'base',
        shield: 8,
        outpost: false,
        mainFunctionality: {
            requirement: [],
            execute: ({ player }) => {
                player.trackShipsPlayed = true       
            }
        }
    }
    return fleetHQ
}

export default fleetHQFactoryFunction