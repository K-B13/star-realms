import { CardDef, cardRegistry, Faction } from "@/app/engine/cards";
import IconComponent from "../reusableComponents/iconComponent";
import { icons } from "../iconIndex";

interface TradeRowSectionProps {
    tradeDeck: string[];
    tradeRow: string[];
    explorerDeck: string[];
    scrapPileCount: number;
    onSelectCard?: (card: CardDef, index: number) => void;
}

const factionColors: Record<Faction, { border: string, bg: string, shadow: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40", shadow: "shadow-blue-500/20" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40", shadow: "shadow-green-500/20" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40", shadow: "shadow-red-500/20" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40", shadow: "shadow-yellow-500/20" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40", shadow: "shadow-gray-500/20" },
};

export default function TradeRowSection({ tradeDeck, tradeRow, explorerDeck, scrapPileCount, onSelectCard }: TradeRowSectionProps) {
    return (
        <div className="flex gap-2.5 items-center">
            {/* Deck and Scrapped Counters */}
            <div className="flex flex-col gap-2.5">
                <div className="border-3 border-cyan-400 rounded-xl bg-slate-800 p-2 w-28 text-center shadow-lg shadow-cyan-500/20">
                    <p className="text-xs font-bold text-cyan-300">Deck</p>
                    <p className="text-lg font-bold text-gray-100">{tradeDeck.length}/80</p>
                </div>
                <div className="border-3 border-red-500 rounded-xl bg-slate-800 p-2 w-28 text-center shadow-lg shadow-red-500/20">
                    <p className="text-xs font-bold text-red-300">Scrapped</p>
                    <p className="text-lg font-bold text-gray-100">{scrapPileCount}</p>
                </div>
            </div>

            {/* Trade Row - 5 cards, scrollable on overflow */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-2.5 min-w-min">
                    {tradeRow.map((card, index) => {
                        const cardDef = cardRegistry[card];
                        const colors = factionColors[cardDef.faction];
                        return <div key={index} className={`w-[calc(20%-0.5rem)] min-w-[150px] flex-shrink-0 border-3 ${colors.border} rounded-xl ${colors.bg} p-3 flex flex-col shadow-lg ${colors.shadow} min-h-[110px] relative`}>
                            <div className="absolute top-2 right-2 flex flex-row items-center gap-0.5">
                                <p className="text-yellow-300 font-bold">{cardDef.cost}</p>
                                <IconComponent img={icons.coin} amount={1} />
                            </div>
                            <div className="text-gray-200 text-sm mb-1 mt-6 text-center font-semibold break-words line-clamp-2">{cardDef.name || 'Empty'}</div>
                            <div className="flex-1 flex items-center justify-center">
                                {card && (
                                    <button 
                                        onClick={() => onSelectCard?.(cardDef, index)}
                                        className={`border-2 ${colors.border} rounded-lg px-4 py-1.5 text-sm font-semibold hover:brightness-125 transition-all text-gray-100`}
                                    >
                                        Buy
                                    </button>
                                )}
                            </div>
                        </div>
                    })}
                </div>
            </div>

            {/* Explorers */}
            <div className="border-3 border-cyan-400 rounded-xl bg-slate-800 p-3 w-28 text-center shadow-lg shadow-cyan-500/20">
                <p className="text-sm font-bold text-cyan-300">Explorers</p>
                <p className="text-xl font-bold text-gray-100">{explorerDeck.length}/10</p>
            </div>
        </div>
    );
}
