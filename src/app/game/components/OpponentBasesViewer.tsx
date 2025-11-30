import { PlayerState, BaseInstance } from "@/app/engine/state";
import { useState } from "react";

interface OpponentBasesViewerProps {
    players: Record<string, PlayerState>;
    playerOrder: string[];
    currentPlayerId: string;
}

export default function OpponentBasesViewer({ players, playerOrder, currentPlayerId }: OpponentBasesViewerProps) {
    const otherPlayers = playerOrder.filter(pid => pid !== currentPlayerId);
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);

    const handlePrevious = () => {
        setSelectedPlayerIndex((prev) => (prev - 1 + otherPlayers.length) % otherPlayers.length);
    };

    const handleNext = () => {
        setSelectedPlayerIndex((prev) => (prev + 1) % otherPlayers.length);
    };

    if (otherPlayers.length === 0) {
        return null;
    }

    const selectedPlayerId = otherPlayers[selectedPlayerIndex];
    const selectedPlayer = players[selectedPlayerId];

    return (
        <div className="border-3 border-purple-500 rounded-xl bg-slate-800 p-3 shadow-lg shadow-purple-500/20 h-40">
            <div className="flex items-center gap-3 h-full">
                {/* Left Navigation */}
                <button 
                    onClick={handlePrevious}
                    className="border-3 border-cyan-400 rounded-lg w-14 h-14 flex items-center justify-center text-cyan-300 text-2xl hover:bg-cyan-900/30 transition-colors shadow-md shadow-cyan-400/20"
                >
                    ◄
                </button>

                {/* Bases Display */}
                <div className="flex-1 h-full flex flex-col">
                    <p className="text-base font-bold text-purple-300 mb-2 text-center">{selectedPlayer.id} Bases</p>
                    <div className="flex gap-3 justify-center flex-wrap flex-1 items-center">
                        {selectedPlayer.bases.length === 0 ? (
                            <p className="text-gray-400 text-sm">No bases</p>
                        ) : (
                            selectedPlayer.bases.map((base, index) => (
                                <div key={index} className="border-2 border-blue-400 rounded-lg bg-slate-600 p-3 w-40 shadow-md shadow-blue-400/20">
                                    <p className="text-center text-sm font-bold text-gray-100 mb-1">{base.id}</p>
                                    <p className="text-center text-xs text-gray-200">
                                        Shield: {base.defence} {base.shield === 'outpost' ? '⚫' : '⚪'}
                                    </p>
                                    {/* Damage bar (red) */}
                                    <div className="mt-1.5 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-red-500 h-full rounded-full transition-all"
                                            style={{ width: `${(base.damage / base.defence) * 100}%` }}
                                        ></div>
                                    </div>
                                    {/* Shield bar (gray background) */}
                                    <div className="mt-1 bg-gray-700 h-2.5 rounded-full"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Navigation */}
                <button 
                    onClick={handleNext}
                    className="border-3 border-cyan-400 rounded-lg w-14 h-14 flex items-center justify-center text-cyan-300 text-2xl hover:bg-cyan-900/30 transition-colors shadow-md shadow-cyan-400/20"
                >
                    ►
                </button>
            </div>
        </div>
    );
}
