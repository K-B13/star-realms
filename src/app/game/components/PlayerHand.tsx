import { PlayerState } from "@/app/engine/state";
import Card from "../reusableComponents/card";
import { cardRegistry } from "@/app/engine/cards";

interface PlayerHandProps {
    player: PlayerState;
    onPlayCard?: (cardIndex: number) => void;
    onViewDiscard?: () => void;
    onViewDeck?: () => void;
}

export default function PlayerHand({ player, onPlayCard, onViewDiscard, onViewDeck }: PlayerHandProps) {
    return (
        <div className="flex gap-2.5 flex-1 min-h-0">
            {/* Left Side: Discard & Deck */}
            <div className="flex flex-col gap-2.5">
                <button 
                    onClick={onViewDiscard}
                    className="border-3 border-emerald-500 rounded-xl bg-slate-800 p-2 w-20 text-center shadow-lg shadow-emerald-500/20 flex-1 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                    <div>
                        <p className="text-xs font-bold text-emerald-300">Discard</p>
                        <p className="text-xs text-gray-400 mt-0.5">{player.discard.length}</p>
                    </div>
                </button>
                <button 
                    onClick={onViewDeck}
                    className="border-3 border-emerald-500 rounded-xl bg-slate-800 p-2 w-20 text-center shadow-lg shadow-emerald-500/20 flex-1 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                    <div>
                        <p className="text-xs font-bold text-emerald-300">Deck</p>
                        <p className="text-xs text-gray-400 mt-0.5">{player.deck.length}</p>
                    </div>
                </button>
            </div>

            {/* Center: Hand Cards */}
            <div className="flex-1 flex gap-2.5">
                {player.hand.map((card, index) => {
                    const cardDef = cardRegistry[card];
                    return (
                        <div key={index} className="flex-1 border-3 border-blue-500 rounded-xl bg-slate-700 p-2 flex flex-col items-center justify-between shadow-lg shadow-blue-500/20">
                            <div className="text-gray-400 text-xs mb-1">{cardDef.name}</div>
                            <div className="flex-1 flex items-center justify-center overflow-hidden">
                                <Card card={cardDef} isInTradeRow={false} />
                            </div>
                            <button 
                                onClick={() => onPlayCard?.(index)}
                                className="border-2 border-yellow-400 rounded-lg px-3 py-1 text-sm text-yellow-300 font-semibold hover:bg-yellow-900/30 transition-colors w-full mt-1"
                            >
                                Play
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Right Side: Player Info */}
            <div className="border-3 border-purple-500 rounded-xl bg-slate-800 p-2 w-32 shadow-lg shadow-purple-500/20 flex flex-col justify-between">
                <div>
                    <p className="text-sm font-bold text-yellow-400 mb-1.5 text-center">{player.id}</p>
                    <p className="text-xs text-gray-200 mb-0.5">Authority: {player.authority}</p>
                    <p className="text-xs text-gray-200 mb-0.5">Trade: {player.trade}</p>
                    <p className="text-xs text-gray-200 mb-0.5">Combat: {player.combat}</p>
                </div>
                <button className="border-2 border-red-500 rounded-lg px-2 py-1.5 text-red-300 font-semibold hover:bg-red-900/30 transition-colors w-full text-xs">
                    End Turn
                </button>
            </div>
        </div>
    );
}
