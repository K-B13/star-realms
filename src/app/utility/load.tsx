// import { BaseType } from "../classes/base";
// import { ShipType } from "../classes/ship";

// export const loadCardData = async (fileName: string, id: number) => {
//     const response = await fetch(`../classes/cards/${fileName}.json`)
//     if (!response.ok) throw new Error(`Could not load deck for ${cardName}`);

//     const rawCards = await response.json();

//     return rawCards.map((cardData: ShipType | BaseType, index: number) => {
//         const newCard = {
//             ...cardData,
//             id: index
//         }
        
//         return createCard(newCard)
//     });
// }