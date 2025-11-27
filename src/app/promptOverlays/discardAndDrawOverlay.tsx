'use client'
import { useState } from "react";
import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { Prompt } from "./opponentChoiceOverlay";
import { cardRegistry } from "../engine/cards";

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
        append({ t: 'CardsDiscardedOrScrappedForDraw', player: currentPlayer, action, discardedIndices: selectedIndices });
        setSelectedIndices([]);
    };

    const skip = () => {
        append({ t: 'PromptCancelled' });
        setSelectedIndices([]);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
                <h3 className="text-lg font-semibold mb-3">
                    {action === 'scrap' ? 'Scrap' : 'Discard'} up to {maxCards} cards, then draw that many
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                    Selected: {selectedIndices.length} / {maxCards}
                </p>
                <div className="flex gap-2 flex-wrap mb-4">
                    {currentPlayerDetails.hand.map((cardId, idx) => {
                        const isSelected = selectedIndices.includes(idx);
                        return (
                            <button
                                key={idx}
                                onClick={() => toggleCard(idx)}
                                className={`px-3 py-2 rounded border-2 transition-colors ${
                                    isSelected 
                                        ? 'bg-blue-500 text-white border-blue-700' 
                                        : 'bg-white border-gray-300 hover:border-blue-300'
                                }`}
                            >
                                {cardRegistry[cardId]?.name || `Card ${idx + 1}`}
                            </button>
                        );
                    })}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={confirm} 
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Confirm ({selectedIndices.length} cards)
                    </button>
                    <button 
                        onClick={skip} 
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
}
