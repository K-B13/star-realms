import { BaseDef, CardDef, Faction } from "@/app/engine/cards";
import IconComponent from "../reusableComponents/iconComponent";
import { icons } from "../iconIndex";

interface CardDetailOverlayProps {
    card: CardDef | null;
    isOpen: boolean;
    onClose: () => void;
    mode: 'hover' | 'click';
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const factionColors: Record<Faction, { border: string, bg: string, text: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/90", text: "text-blue-300" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/90", text: "text-green-300" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/90", text: "text-red-300" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/90", text: "text-yellow-300" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/90", text: "text-gray-300" },
};

export default function CardDetailOverlay({ card, isOpen, onClose, mode, onMouseEnter, onMouseLeave }: CardDetailOverlayProps) {
    if (!isOpen || !card) return null;

    const colors = factionColors[card.faction];
    const isBase = card.type === 'base';
    const baseDef = isBase ? (card as BaseDef) : null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
        >
            {mode === 'click' && <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto" onClick={onClose} />}
            
            <div 
                className={`relative border-3 ${colors.border} rounded-xl ${colors.bg} p-6 max-w-md w-full shadow-2xl pointer-events-auto`}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={mode === 'hover' ? onMouseEnter : undefined}
                onMouseLeave={mode === 'hover' ? onMouseLeave : undefined}
            >
                {/* Close button for click mode */}
                {mode === 'click' && (
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-500 text-white font-bold flex items-center justify-center transition-all"
                    >
                        ✕
                    </button>
                )}

                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className={`text-2xl font-bold ${colors.text}`}>{card.name}</h2>
                        <p className="text-sm text-gray-300 mt-1">{card.faction}</p>
                        {card.description && (
                            <p className="text-xs text-gray-400 italic mt-2">{card.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <p className="text-yellow-300 font-bold text-xl">{card.cost}</p>
                        <IconComponent img={icons.coin} amount={1} />
                    </div>
                </div>

                {/* Base-specific info */}
                {isBase && baseDef && (
                    <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-200 font-semibold">Defence:</span>
                            <span className="text-cyan-300 font-bold">{baseDef.defence}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-gray-200 font-semibold">Shield Type:</span>
                            <span className="text-cyan-300">{baseDef.shield === 'outpost' ? '⚫ Outpost' : '⚪ Normal'}</span>
                        </div>
                    </div>
                )}

                {/* Card Type */}
                <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.border} border-2`}>
                        {card.type === 'base' ? '🏰 Base' : '🚀 Ship'}
                    </span>
                </div>

                {/* Abilities */}
                <div className="space-y-4">
                    {/* Play abilities */}
                    {card.text.play && card.text.play.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-cyan-300 mb-2">Primary:</h3>
                            <div className="bg-slate-700/30 rounded-lg p-3 space-y-1">
                                {card.text.play.map((text, idx) => (
                                    <p key={idx} className="text-gray-200">{text}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ally abilities */}
                    {card.text.ally && card.text.ally.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-purple-300 mb-2">Ally:</h3>
                            <div className="bg-purple-900/20 rounded-lg p-3 space-y-1">
                                {card.text.ally.map((text, idx) => (
                                    <p key={idx} className="text-gray-200">{text}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scrap abilities */}
                    {card.text.scrap && card.text.scrap.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-red-300 mb-2">Scrap:</h3>
                            <div className="bg-red-900/20 rounded-lg p-3 space-y-1">
                                {card.text.scrap.map((text, idx) => (
                                    <p key={idx} className="text-gray-200">{text}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Click mode instruction */}
                {mode === 'click' && (
                    <p className="text-center text-gray-400 text-sm mt-4">Click outside or press ✕ to close</p>
                )}
            </div>
        </div>
    );
}
