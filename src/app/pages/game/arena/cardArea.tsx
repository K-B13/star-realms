import { CardType } from "@/app/classes/card";
import TradeRow from "./tradeRow";

export default function CardArea({ tradeDeck, tradeRow, selectTradeRowCard }: { tradeDeck: CardType[], tradeRow: CardType[], selectTradeRowCard: (card: CardType) => void }) {
    return (
        <div>
            <div>Deck {tradeDeck.length}</div>
            <TradeRow tradeRow={tradeRow} selectTradeRowCard={selectTradeRowCard}/>
            <div>Explorers</div>
        </div>
    )
}