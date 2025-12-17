import { PlayerState } from "@/app/engine/state";
import Card from "../reusableComponents/card";
import { CardDef, cardRegistry, Faction } from "@/app/engine/cards";
import { Zone } from "@/app/engine/events";

interface PlayerHandProps {
    player: PlayerState;
    onPlayCard?: (card: CardDef, cardIndex: number) => void;
    onScrapCard?: (card: CardDef, from: Zone, cardIndex: number) => void;
    onViewDiscard?: () => void;
    onViewDeck?: () => void;
    onViewScrap?: () => void;
    onEndTurn?: () => void;
    onCardClick?: (card: CardDef, mode: 'hover' | 'click') => void;
    scrapPileCount?: number;
}

const factionColors: Record<Faction, { border: string, bg: string, shadow: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40", shadow: "shadow-blue-500/20" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40", shadow: "shadow-green-500/20" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40", shadow: "shadow-red-500/20" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40", shadow: "shadow-yellow-500/20" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40", shadow: "shadow-gray-500/20" },
};

export default function PlayerHand({ player, onPlayCard, onScrapCard, onViewDiscard, onViewDeck, onViewScrap, onEndTurn, onCardClick, scrapPileCount = 0 }: PlayerHandProps) {
    const countBases = (playerId: PlayerState) => {
        const silverShields = playerId.bases.reduce((acc, base) => {
            if (base.shield === 'normal') {
                const leftoverShield = base.defence - base.damage
                return acc + leftoverShield
            }
            return acc
        }, 0);
        const blackShields = playerId.bases.reduce((acc, base) => {
            if (base.shield === 'outpost') {
                const leftoverShield = base.defence - base.damage
                return acc + leftoverShield
            }
            return acc
        }, 0);
        return { silverShields, blackShields };
    };
    const { silverShields, blackShields } = countBases(player);
    return (
        <div className="flex gap-2.5 flex-1 min-h-0">
            {/* Left Side: Discard, Deck & Scrap */}
            <div className="flex flex-col gap-2.5">
                <button 
                    onClick={onViewDiscard}
                    className="border-3 border-purple-500 rounded-xl bg-slate-800 p-2 w-20 text-center shadow-lg shadow-purple-500/20 flex-1 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                    <div>
                        <p className="text-xs font-bold text-purple-300">Discard</p>
                        <p className="text-xs text-gray-400 mt-0.5">{player.discard.length + player.inPlay.length}</p>
                    </div>
                </button>
                <button 
                    onClick={onViewDeck}
                    className="border-3 border-cyan-500 rounded-xl bg-slate-800 p-2 w-20 text-center shadow-lg shadow-cyan-500/20 flex-1 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                    <div>
                        <p className="text-xs font-bold text-cyan-300">Deck</p>
                        <p className="text-xs text-gray-400 mt-0.5">{player.deck.length}</p>
                    </div>
                </button>
                <button 
                    onClick={onViewScrap}
                    className="border-3 border-red-500 rounded-xl bg-slate-800 p-2 w-20 text-center shadow-lg shadow-red-500/20 flex-1 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                    <div>
                        <p className="text-xs font-bold text-red-300">Scrap</p>
                        <p className="text-xs text-gray-400 mt-0.5">{scrapPileCount}</p>
                    </div>
                </button>
            </div>

            {/* Center: Hand Cards - Scrollable with fixed card width */}
            <div className="flex-1 overflow-x-auto min-h-[280px]">
                <div className="flex gap-2.5 h-full min-h-[280px]">
                    {player.hand.map((card, index) => {
                        const cardDef = cardRegistry[card];
                        const colors = factionColors[cardDef.faction];
                        return (
                            <div 
                                key={index} 
                                className={`w-[calc(20%-0.5rem)] min-w-[150px] flex-shrink-0 border-3 ${colors.border} rounded-xl ${colors.bg} p-2 flex flex-col shadow-lg ${colors.shadow} relative cursor-pointer hover:brightness-110 transition-all`}
                                onClick={(e) => {
                                    // Only show detail if not clicking a button
                                    if (!(e.target as HTMLElement).closest('button')) {
                                        onCardClick?.(cardDef, 'click');
                                    }
                                }}
                            >
                                {cardDef.selfScrap && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onScrapCard?.(cardDef, 'hand', index);
                                        }}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center transition-all shadow-md z-10"
                                        title="Scrap this card"
                                    >
                                        🗑
                                    </button>
                                )}
                                {/* Card type badge */}
                                <div className="absolute top-1 left-1">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${colors.border} border ${colors.bg} font-semibold`}>
                                        {cardDef.type === 'base' ? '🏰' : '🚀'}
                                    </span>
                                </div>
                                <div className="text-gray-200 text-xs mb-1 text-center font-semibold break-words line-clamp-2 w-full mt-6">{cardDef.name}</div>
                                <div className="flex-1 overflow-y-auto min-h-0 text-sm">
                                    <Card card={cardDef} isInTradeRow={false} inPlayerHand={true} />
                                </div>
                                {onPlayCard && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPlayCard(cardDef, index);
                                        }}
                                        className={`border-2 ${colors.border} rounded-lg px-3 py-1 text-sm font-semibold hover:brightness-125 transition-all w-full mt-1 text-gray-100`}
                                    >
                                        Play
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side: Player Info */}
            <div className="border-3 border-purple-500 rounded-xl bg-slate-800 p-2 w-32 shadow-lg shadow-purple-500/20 flex flex-col justify-between">
                <div>
                    <p className="text-sm font-bold text-yellow-400 mb-1.5 text-center">{player.id}</p>
                    <p className="text-xs text-gray-200 mb-0.5">Authority: {player.authority}</p>
                    <p className="text-xs text-gray-200 mb-0.5">Trade: {player.trade}</p>
                    <p className="text-xs text-gray-200 mb-0.5">Combat: {player.combat}</p>
                    <div className="flex gap-3 text-xs text-gray-200">
                        <span className="flex items-center gap-1">
                            <span className="text-gray-300">⚪</span> {silverShields}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="text-gray-900">⚫</span> {blackShields}
                        </span>
                    </div>
                </div>
                {onEndTurn && (
                    <button 
                        onClick={onEndTurn}
                        className="border-2 border-red-500 rounded-lg px-2 py-1.5 text-red-300 font-semibold hover:bg-red-900/30 transition-colors w-full text-xs"
                    >
                        End Turn
                    </button>
                )}
            </div>
        </div>
    );
}
