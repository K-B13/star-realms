import { CardType } from "@/app/classes/card";

export default function TradeRow({ tradeRow, selectTradeRowCard }: { tradeRow: CardType[], selectTradeRowCard: (card: CardType) => void }) {
    
    return (
        <div>
            <div>Deck</div>
            <div>
            <h1>Trade Row</h1>
            <div>{tradeRow.map((card, index) => {
                return (
                    <div key={index}>
                        <p>
                        {card.name}
                        </p>
                        <p>{card.cost}</p>
                        <div dangerouslySetInnerHTML={{__html: card.mainDescription}}></div>
                        {card.allyDescription && <div dangerouslySetInnerHTML={{__html: card.allyDescription}}></div>}
                        {card.secondaryDescription && <div>{card.secondaryDescription}</div>}
                        {card.scrapDescription && <div dangerouslySetInnerHTML={{__html: card.scrapDescription}}></div>}
                        {card.extraText && <div>{card.extraText}</div>}
                        <button onClick={() => selectTradeRowCard(card)}>Select</button>
                    </div>
                )
            })}</div>
            </div>
            <div>Explorers</div>
        </div>
    )
}