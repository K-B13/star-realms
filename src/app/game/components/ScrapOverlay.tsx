import { cardRegistry, Faction } from "@/app/engine/cards";

interface ScrapOverlayProps {
    scrappedCards: string[];
    onClose: () => void;
}

const factionColors: Record<Faction, { border: string, bg: string, shadow: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40", shadow: "shadow-blue-500/20" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40", shadow: "shadow-green-500/20" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40", shadow: "shadow-red-500/20" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40", shadow: "shadow-yellow-500/20" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40", shadow: "shadow-gray-500/20" },
};

export default function ScrapOverlay({scrappedCards, onClose}: ScrapOverlayProps) {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-red-500 rounded-xl shadow-2xl shadow-red-500/30 p-6 max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-red-300">Scrap Heap</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-500 text-white font-bold flex items-center justify-center transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Card count */}
                <p className="text-gray-400 text-sm mb-4">
                    {scrappedCards.length} {scrappedCards.length === 1 ? 'card' : 'cards'} scrapped
                </p>

                {/* Cards grid - scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {scrappedCards.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-lg">No cards scrapped yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {scrappedCards.map((card, idx) => {
                                const cardDef = cardRegistry[card];
                                const colors = factionColors[cardDef.faction];
                                
                                // Count ability sections
                                const hasPlay = cardDef.text.play.length > 0;
                                const hasAlly = cardDef.text.ally && cardDef.text.ally.length > 0;
                                const hasScrap = cardDef.text.scrap && cardDef.text.scrap.length > 0;
                                const abilitySections = [hasPlay, hasAlly, hasScrap].filter(Boolean).length;
                                
                                // Dynamic text size based on number of ability sections
                                const textSize = abilitySections === 3 ? 'text-[0.65rem]' : abilitySections === 2 ? 'text-xs' : 'text-sm';
                                
                                return (
                                    <div 
                                        key={idx}
                                        className={`border-3 ${colors.border} rounded-xl ${colors.bg} p-3 shadow-lg ${colors.shadow} flex flex-col h-64`}
                                    >
                                        {/* Card name */}
                                        <div className="text-gray-200 text-sm mb-2 text-center font-semibold break-words line-clamp-2 min-h-[2.5rem]">
                                            {cardDef.name}
                                        </div>
                                        
                                        {/* Card abilities - scrollable */}
                                        <div className={`flex-1 overflow-y-auto min-h-0 ${textSize} text-center`}>
                                            {/* Primary ability */}
                                            {hasPlay && (
                                                <div className="mb-2">
                                                    <p className="font-bold text-cyan-300 mb-1">Primary:</p>
                                                    {cardDef.text.play.map((desc, id) => (
                                                        <p key={id} className="mb-1 text-gray-200">{desc}</p>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Ally ability */}
                                            {hasAlly && (
                                                <div className="mb-2">
                                                    <p className="font-bold text-purple-300 mb-1">Ally:</p>
                                                    {cardDef.text.ally!.map((desc, id) => (
                                                        <p key={id} className="mb-1 text-gray-200">{desc}</p>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Scrap ability */}
                                            {hasScrap && (
                                                <div className="mb-2">
                                                    <p className="font-bold text-red-300 mb-1">Scrap:</p>
                                                    {cardDef.text.scrap!.map((desc, id) => (
                                                        <p key={id} className="mb-1 text-gray-200">{desc}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer button */}
                <button
                    onClick={onClose}
                    className="mt-4 border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-300 px-6 py-2 rounded-lg font-semibold transition-all w-full"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
