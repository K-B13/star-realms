'use client'
import { useState } from "react";
import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { Prompt } from "./opponentChoiceOverlay";
import { cardRegistry, Faction } from "../engine/cards";
import Card from "../game/reusableComponents/card";

const factionColors: Record<Faction, { border: string, bg: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40" },
};

interface DiscardAndDrawOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

export default function DiscardAndDrawOverlay({ state, activePrompt, append, currentPlayer }: DiscardAndDrawOverlayProps) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'discardOrScrapAndDraw';
    const [ selectedIndices, setSelectedIndices ] = useState<number[]>([]);
    
    if (!isOpen) return null;

    const maxCards = (activePrompt as Prompt)?.data?.maxCards ?? 0;
    const currentPlayerDetails = state.players[currentPlayer];
    const action = (activePrompt as Prompt)?.data?.action ?? 'discard';

    const toggleCard = (idx: number) => {
        if (selectedIndices.includes(idx)) {
            setSelectedIndices(selectedIndices.filter(i => i !== idx));
        } else if (selectedIndices.length < maxCards) {
            setSelectedIndices([...selectedIndices, idx]);
        }
    };

    const confirm = () => {
        append({ t: 'CardsDiscardedOrScrappedForDraw', player: currentPlayer, action, discardedIndices: selectedIndices, timestamp: Date.now() });
        setSelectedIndices([]);
    };

    const skip = () => {
        append({ t: 'PromptCancelled', kind: 'discardOrScrapAndDraw', timestamp: Date.now() });
        setSelectedIndices([]);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">
                    {action === 'scrap' ? 'Scrap' : 'Discard'} & Draw
                </h3>
                <p className="text-gray-300 text-sm mb-2 text-center">
                    {action === 'scrap' ? 'Scrap' : 'Discard'} up to {maxCards} cards, then draw that many
                </p>
                <p className="text-cyan-300 text-sm font-semibold mb-4 text-center">
                    Selected: {selectedIndices.length} / {maxCards}
                </p>
                <div className="flex gap-3 flex-wrap justify-center mb-6">
                    {currentPlayerDetails.hand.map((cardId, idx) => {
                        const isSelected = selectedIndices.includes(idx);
                        const cardDef = cardRegistry[cardId];
                        const colors = factionColors[cardDef.faction];
                        return (
                            <div
                                key={idx}
                                onClick={() => toggleCard(idx)}
                                className={`border-3 ${isSelected ? 'border-purple-400 ring-4 ring-purple-500/50' : colors.border} rounded-xl ${colors.bg} p-3 w-48 h-64 cursor-pointer transition-all shadow-lg hover:shadow-xl flex flex-col ${
                                    isSelected ? 'scale-105 brightness-125' : 'hover:brightness-110'
                                }`}
                            >
                                <div className="flex-1 overflow-y-auto text-base">
                                    <Card card={cardDef} isInTradeRow={false} />
                                </div>
                                <div className="mt-2 w-full text-center py-2 rounded-lg font-semibold text-sm">
                                    {isSelected ? '✓ Selected' : 'Click to Select'}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={confirm} 
                        className="flex-1 border-2 border-green-500 bg-green-900/40 hover:bg-green-800/60 text-green-200 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                    >
                        ✓ Confirm ({selectedIndices.length} cards)
                    </button>
                    <button 
                        onClick={skip} 
                        className="border-2 border-gray-500 bg-gray-800/40 hover:bg-gray-700/60 text-gray-300 px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
}
