import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import Card from "../game/reusableComponents/card";
import { cardRegistry, Faction } from "../engine/cards";

const factionColors: Record<Faction, { border: string, bg: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40" },
};

interface ChooseCardToCopyProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

export default function ChooseCardToCopyOverlay({ state, activePrompt, append }: ChooseCardToCopyProps) {
    const isOpen =
    activePrompt?.t === 'PromptShown' &&
    activePrompt.kind === 'chooseInPlayShip';

    if (!isOpen) return null;

    const p = state.order[state.activeIndex];
    const playedThisTurn = state.turn.playedThisTurn;
    
    const choose = (idx: number) => {
      append({ t:'TargetCardChosen', player: p, source: 'copyShip', inPlayIndex: idx });
    };
    const skip = () =>
        append({ t: 'PromptCancelled' });  

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-3xl w-full">
                <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Copy Ship Ability</h3>
                <p className="text-gray-300 text-sm mb-6 text-center">Choose a ship you played this turn to copy its abilities</p>
                <div className="flex gap-3 flex-wrap justify-center mb-4">
                  {
                  playedThisTurn.map((card, idx) => {
                    const cardDef = cardRegistry[card];
                    if (idx === playedThisTurn.length - 1)
                        return <button 
                            key={idx} 
                            onClick={skip}
                            className="border-2 border-gray-500 bg-gray-800/40 hover:bg-gray-700/60 text-gray-300 px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                            Skip
                        </button>
                    const colors = factionColors[cardDef.faction];
                    return <div 
                        key={idx}
                        className={`border-3 ${colors.border} rounded-xl ${colors.bg} p-3 w-48 h-64 cursor-pointer hover:brightness-125 transition-all shadow-lg hover:shadow-xl flex flex-col`}
                    >
                        <div className="flex-1 overflow-y-auto text-sm">
                            <Card card={cardDef} isInTradeRow={false}/>
                        </div>
                        <button 
                            onClick={() => choose(idx)}
                            className="mt-2 w-full border-2 border-cyan-500 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 px-3 py-2 rounded-lg font-semibold transition-all"
                        >
                            Copy
                        </button>
                    </div>
                  })}
                </div>
            </div>
        </div>
    )
}