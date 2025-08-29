import { CardType } from "./card";

export interface ShipType extends CardType {
    type: 'ship'
    choice?: string[]
}

// const shipFactoryFunction = (cardDetails: ) => {
//     const ship: ShipType = {
//         name,
//         faction,
//         id,
//         mainFunctionality,
//         bonusFunctionality,
//         scrapFunctionality,
//         type: 'ship'
//     }
// }