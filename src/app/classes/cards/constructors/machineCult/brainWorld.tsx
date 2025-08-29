import scrapAndDraw, { cardToScrapType } from "@/app/cardFunctions/scrapAndDraw";
import { BaseType } from "@/app/classes/base";
import { BaseCardType, CardType } from "@/app/classes/card";

export const brainWorldFactoryFunction = (id: number, brainWorldData: BaseCardType) => {
    const brainWorld: BaseType = {
        ...brainWorldData,
        id,
        type: 'base',
        shield: 6,
        outpost: true,
        mainFunctionality: {
            requirement: ['cardsToScrap', 'scrapPile'],
            execute: ({ player, context }) => {
                const { cardsToScrap, scrapPile } = context as { cardsToScrap: cardToScrapType[], scrapPile: CardType[] }
                cardsToScrap.forEach((cardToScrap: cardToScrapType) => {
                    scrapAndDraw(player, cardToScrap, scrapPile)
                })
            }
        }
    }

    return brainWorld
}