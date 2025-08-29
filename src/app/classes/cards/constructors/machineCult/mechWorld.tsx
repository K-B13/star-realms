import { BaseType } from "@/app/classes/base"
import { BaseCardType } from "@/app/classes/card"

export const mechWorldFactoryFunction = (id: number, mechWorldData: BaseCardType) => {
    const mechWorld: BaseType = {
        ...mechWorldData,
        id,
        type: 'base',
        shield: 6,
        outpost: true,
        mainFunctionality: {
            requirement: [''],
            execute: ({ player }) => {
                return
            }
        }
    }
    return mechWorld
}