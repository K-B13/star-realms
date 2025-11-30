import { CardDef } from "@/app/engine/cards";

interface TradeRowSectionProps {
    tradeDeck: string[];
    tradeRow: string[];
    explorerDeck: string[];
    onSelectCard?: (card: string, index: number) => void;
}

export default function TradeRowSection({ tradeDeck, tradeRow, explorerDeck, onSelectCard }: TradeRowSectionProps) {
    return (
        <div className="flex gap-2.5 items-center">
            {/* Deck Counter */}
            <div className="border-3 border-cyan-400 rounded-xl bg-slate-800 p-3 w-28 text-center shadow-lg shadow-cyan-500/20">
                <p className="text-sm font-bold text-cyan-300">Deck</p>
                <p className="text-xl font-bold text-gray-100">{tradeDeck.length}/80</p>
            </div>

            {/* Trade Row - 5 cards */}
            <div className="flex-1 flex gap-2.5">
                {tradeRow.map((card, index) => (
                    <div key={index} className="flex-1 border-3 border-purple-500 rounded-xl bg-slate-700 p-3 flex flex-col items-center justify-center shadow-lg shadow-purple-500/20 min-h-[110px]">
                        <div className="text-gray-400 text-sm mb-1">{card || 'Empty'}</div>
                        {card && (
                            <button 
                                onClick={() => onSelectCard?.(card, index)}
                                className="border-2 border-cyan-400 rounded-lg px-4 py-1.5 text-sm text-cyan-300 font-semibold hover:bg-cyan-900/30 transition-colors"
                            >
                                Select
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Explorers */}
            <div className="border-3 border-cyan-400 rounded-xl bg-slate-800 p-3 w-28 text-center shadow-lg shadow-cyan-500/20">
                <p className="text-sm font-bold text-cyan-300">Explorers</p>
                <p className="text-xl font-bold text-gray-100">{explorerDeck.length}/10</p>
            </div>
        </div>
    );
}
