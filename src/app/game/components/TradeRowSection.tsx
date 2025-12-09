import { CardDef, cardRegistry, Faction } from "@/app/engine/cards";
import IconComponent from "../reusableComponents/iconComponent";
import { icons } from "../iconIndex";

interface TradeRowSectionProps {
    tradeDeck: string[];
    tradeRow: (string | null)[];
    explorerDeck: string[];
    scrapPileCount: number;
    onSelectCard?: (card: CardDef, source: 'row' | 'explorer', index: number) => void;
    onCardHover?: (card: CardDef, mode: 'hover' | 'click') => void;
    onCardLeave?: () => void;
    onCardClick?: (card: CardDef, mode: 'hover' | 'click') => void;
    onViewTradeDeck?: () => void;
}

const factionColors: Record<Faction, { border: string, bg: string, shadow: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40", shadow: "shadow-blue-500/20" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40", shadow: "shadow-green-500/20" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40", shadow: "shadow-red-500/20" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40", shadow: "shadow-yellow-500/20" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40", shadow: "shadow-gray-500/20" },
};

export default function TradeRowSection({ tradeDeck, tradeRow, explorerDeck, scrapPileCount, onSelectCard, onCardHover, onCardLeave, onCardClick, onViewTradeDeck }: TradeRowSectionProps) {
    return (
        <div className="flex gap-2.5 items-center">
            {/* Deck and Scrapped Counters */}
            <div 
                className="relative border-3 border-cyan-400 rounded-xl bg-slate-800 p-2 w-30 text-center shadow-lg shadow-cyan-500/20 cursor-pointer hover:brightness-110 transition-all flex flex-col justify-center min-h-[100px]"
                onClick={onViewTradeDeck}
            >
                <p className="text-sm font-bold text-cyan-300 mb-2">Trade Deck</p>
                <p className="text-xl font-bold text-gray-100">{tradeDeck.length}/80</p>
            </div>

            {/* Trade Row - 5 cards, scrollable on overflow */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-2.5 min-w-min">
                    {tradeRow.map((card, index) => {
                        if (!card) {
                            return <div 
                                key={index} 
                                className="w-[calc(20%-0.5rem)] min-w-[150px] flex-shrink-0 border-3 border-gray-600 rounded-xl bg-gray-800/40 p-3 flex flex-col shadow-lg shadow-gray-500/20 min-h-[110px] relative"
                            >
                                <div className="text-gray-500 text-sm mb-1 mt-6 text-center font-semibold">Empty</div>
                            </div>
                        }
                        const cardDef = cardRegistry[card];
                        const colors = factionColors[cardDef.faction];
                        return <div 
                            key={index} 
                            className={`w-[calc(20%-0.5rem)] min-w-[150px] flex-shrink-0 border-3 ${colors.border} rounded-xl ${colors.bg} p-3 flex flex-col shadow-lg ${colors.shadow} min-h-[110px] relative cursor-pointer hover:brightness-110 transition-all`}
                            onMouseEnter={() => onCardHover?.(cardDef, 'hover')}
                            onMouseLeave={() => onCardLeave?.()}
                            onClick={(e) => {
                                // Only show detail if not clicking the buy button
                                if (!(e.target as HTMLElement).closest('button')) {
                                    onCardClick?.(cardDef, 'click');
                                }
                            }}
                        >
                            <div className="absolute top-2 right-2 flex flex-row items-center gap-0.5">
                                <p className="text-yellow-300 font-bold">{cardDef.cost}</p>
                                <IconComponent img={icons.coin} amount={1} size={18} />
                            </div>
                            <div className="text-gray-200 text-sm mb-1 mt-6 text-center font-semibold break-words line-clamp-2">{cardDef.name || 'Empty'}</div>
                            <div className="flex-1 flex items-center justify-center">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectCard?.(cardDef, 'row', index);
                                    }}
                                    className={`border-2 ${colors.border} rounded-lg px-4 py-1.5 text-sm font-semibold hover:brightness-125 transition-all text-gray-100`}
                                >
                                    Buy
                                </button>
                            </div>
                        </div>
                    })}
                </div>
            </div>

            {/* Explorers */}
            <div 
                className="relative border-3 border-cyan-400 rounded-xl bg-slate-800 p-3 w-40 text-center shadow-lg shadow-cyan-500/20 cursor-pointer hover:brightness-110 transition-all"
                onMouseEnter={() => onCardHover?.(cardRegistry['EXPLORER'], 'hover')}
                onMouseLeave={() => onCardLeave?.()}
                onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('button')) {
                        onCardClick?.(cardRegistry['EXPLORER'], 'click');
                    }
                }}
            >
                <div className="absolute top-2 right-2 flex flex-row items-center gap-0.5">
                    <p className="text-yellow-300 font-bold">2</p>
                    <IconComponent img={icons.coin} amount={1} size={18} />
                </div>
                <p className="text-sm font-bold text-cyan-300 mb-2">Explorers</p>
                <p className="text-xl font-bold text-gray-100">{explorerDeck.length}/10</p>
                {
                    explorerDeck.length > 0 && (
                        <button 
                            className="border-2 border-cyan-400 rounded-lg px-4 py-1.5 text-sm font-semibold hover:brightness-125 transition-all text-gray-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectCard?.(cardRegistry['EXPLORER'], 'explorer', 0);
                            }}
                        >
                            Buy
                        </button>
                    )
                }
            </div>
        </div>
    );
}
