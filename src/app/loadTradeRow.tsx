import { CardType } from "./classes/card"
import tradeFederationCards from "./classes/cards/constructors/tradeFederation/index"

export const loadTradeRow = () => {
    const tradeRowCards: CardType[] = []
    let numTradeFederationCards = 1;
    tradeFederationCards.forEach((cardFactory) => {
        for(let i = 1; i <= cardFactory.amount; i++) {
            const createdCard = cardFactory.factoryFunction(`trade-federation-${numTradeFederationCards}`)
            tradeRowCards.push(createdCard)
            numTradeFederationCards++
        }
    })
    return tradeRowCards
    // tradeRowData['Machine Cult'].forEach((card: string, index: number) => {
        
    // })
    // tradeRowData['The Blob'].forEach((card: string, index: number) => {
        
    // })
    // tradeRowData['Star Empire'].forEach((card: string, index: number) => {
        
    // })
}