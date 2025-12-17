import { BaseInstance } from "@/app/engine/state";
import { BaseDef, CardDef, cardRegistry, Faction } from "@/app/engine/cards";

interface CurrentPlayerBasesProps {
    bases: BaseInstance[];
    playerId: string;
    onActivateBase?: (baseIndex: number) => void;
    onScrapBase?: (baseIndex: number) => void;
    onCardHover?: (card: CardDef, mode: 'hover' | 'click', onActivate?: () => void, alreadyActivated?: boolean, onScrap?: () => void) => void;
    onCardLeave?: () => void;
}

const factionColors: Record<Faction, { border: string, bg: string, shadow: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40", shadow: "shadow-blue-500/20" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40", shadow: "shadow-green-500/20" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40", shadow: "shadow-red-500/20" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40", shadow: "shadow-yellow-500/20" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40", shadow: "shadow-gray-500/20" },
};

export default function CurrentPlayerBases({ bases, playerId, onActivateBase, onScrapBase, onCardHover, onCardLeave }: CurrentPlayerBasesProps) {
    // Helper: Check if a base has activatable abilities (not just scrap or passive shield)
    const hasActivatableAbilities = (cardDef: BaseDef): boolean => {
        return cardDef.abilities.some(ability => 
            ability.trigger === 'onPlay' || ability.trigger === 'onAlly'
        );
    };

    return (
        <div className="border-3 border-cyan-500 rounded-xl bg-slate-800 p-3 shadow-lg shadow-cyan-500/20">
            <p className="text-base font-bold text-cyan-300 mb-2 text-center">{playerId} Bases (You)</p>
            <div className="flex gap-3 justify-center flex-wrap items-center content-center min-h-[140px]">
                {bases.length === 0 ? (
                    <p className="text-gray-400 text-sm">No bases in play</p>
                ) : (
                    bases.map((base, index) => {
                        const cardDef = cardRegistry[base.id] as BaseDef
                        const colors = factionColors[cardDef.faction];
                        const canActivate = hasActivatableAbilities(cardDef) && !base.activatedThisTurn && onActivateBase;
                        
                        return (
                        <div 
                            key={index} 
                            className={`border-2 ${colors.border} rounded-lg ${colors.bg} p-3 w-40 shadow-md ${colors.shadow} cursor-pointer hover:brightness-110 transition-all relative`}
                            onMouseEnter={() => {
                                const activateCallback = canActivate ? () => onActivateBase(index) : undefined;
                                const scrapCallback = cardDef.selfScrap ? () => onScrapBase?.(index) : undefined;
                                onCardHover?.(cardDef, 'hover', activateCallback, base.activatedThisTurn, scrapCallback);
                            }}
                            onMouseLeave={() => onCardLeave?.()}
                            onClick={(e) => {
                                // Only activate if not clicking scrap button
                                if (!(e.target as HTMLElement).closest('button') && canActivate) {
                                    onActivateBase(index)
                                }
                            }}
                        >
                            {cardDef.selfScrap && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onScrapBase?.(index);
                                    }}
                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center transition-all shadow-md z-10"
                                    title="Scrap this base"
                                >
                                    🗑
                                </button>
                            )}
                            <p className="text-center text-sm font-bold text-gray-100 mb-1">{base.id}</p>
                            <p className="text-center text-xs text-gray-200">
                                Shield: {base.defence} {base.shield === 'outpost' ? '⚫' : '⚪'}
                            </p>
                            {base.activatedThisTurn ? (
                                <p className="text-center text-xs text-green-400 mt-1">✓ Activated</p>
                            ) : (
                                <p className="text-center text-xs text-cyan-400 mt-1">● Ready</p>
                            )}
                            {/* Damage bar (red) */}
                            <div className="mt-2 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-red-500 h-full rounded-full transition-all"
                                    style={{ width: `${(base.damage / base.defence) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
