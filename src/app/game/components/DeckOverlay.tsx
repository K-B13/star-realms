import { cardRegistry, Faction } from "@/app/engine/cards";
import { PlayerState } from "@/app/engine/state";

interface DeckOverlayProps {
    currentPlayer: PlayerState;
    onClose: () => void;
}

const factionColors: Record<Faction, { border: string, bg: string, text: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40", text: "text-blue-300" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40", text: "text-green-300" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40", text: "text-red-300" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40", text: "text-yellow-300" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40", text: "text-gray-300" },
};

export default function DeckOverlay({currentPlayer, onClose}: DeckOverlayProps) {
    // Count cards by faction
    const factionCounts: Record<Faction, number> = {
        "Trade Federation": 0,
        "Blob Faction": 0,
        "Machine Cult": 0,
        "Star Empire": 0,
        "Neutral": 0,
    };

    currentPlayer.deck.forEach(cardId => {
        const cardDef = cardRegistry[cardId];
        if (cardDef) {
            factionCounts[cardDef.faction]++;
        }
    });

    // Filter out factions with 0 cards
    const factionsInDeck = (Object.entries(factionCounts) as [Faction, number][])
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]); // Sort by count descending

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-cyan-500 rounded-xl shadow-2xl shadow-cyan-500/30 p-6 max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-cyan-300">Deck</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-500 text-white font-bold flex items-center justify-center transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Total card count */}
                <p className="text-gray-400 text-sm mb-6">
                    {currentPlayer.deck.length} {currentPlayer.deck.length === 1 ? 'card' : 'cards'} remaining
                </p>

                {/* Faction breakdown */}
                <div className="space-y-3">
                    {factionsInDeck.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg">Deck is empty</p>
                        </div>
                    ) : (
                        factionsInDeck.map(([faction, count]) => {
                            const colors = factionColors[faction];
                            return (
                                <div 
                                    key={faction}
                                    className={`border-2 ${colors.border} rounded-lg ${colors.bg} p-4 flex justify-between items-center`}
                                >
                                    <span className={`font-bold text-lg ${colors.text}`}>
                                        {faction}
                                    </span>
                                    <span className="text-gray-200 font-semibold text-xl">
                                        {count}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer button */}
                <button
                    onClick={onClose}
                    className="mt-6 border-2 border-cyan-500 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 px-6 py-2 rounded-lg font-semibold transition-all w-full"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
