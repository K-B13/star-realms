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

interface ChooseOpponentBaseOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

export default function ChooseOpponentBaseOverlay({ state, activePrompt, append, currentPlayer }: ChooseOpponentBaseOverlayProps) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseOpponentBase';
    if (!isOpen) return null;

    const target: string | undefined = (activePrompt as Prompt)?.data?.target;
    if (!target) return null;

    const targetBases = state.players[target].bases;

    const destroyBase = (idx: number) =>
        append({ t: 'BaseChosenToDestroy', player: currentPlayer, targetPlayer: target, baseIndex: idx });

    const skip = () =>
        append({ t: 'PromptCancelled', kind: 'chooseOpponentBase' });

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Destroy Opponent Base</h3>
                <p className="text-gray-300 text-sm mb-6 text-center">Choose a base to destroy from {target}&apos;s bases</p>
                <div className="flex gap-4 flex-wrap justify-center mb-4">
                    {targetBases.map((base, idx) => {
                        const def = cardRegistry[base.id];
                        const remainingHP = base.defence - base.damage;
                        const icon = base.shield === 'outpost' ? '⚫' : '⚪';
                        const iconColor = base.shield === 'outpost' ? 'text-gray-900' : 'text-gray-300';
                        const colors = factionColors[def.faction];
                        
                        return (
                            <div
                                key={idx}
                                onClick={() => destroyBase(idx)}
                                className={`border-3 ${colors.border} rounded-xl ${colors.bg} p-3 w-56 h-72 cursor-pointer hover:brightness-125 transition-all shadow-lg hover:shadow-xl flex flex-col`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-gray-100">{def.name}</span>
                                    <span className="flex items-center gap-1 text-lg">
                                        <span className={iconColor}>{icon}</span>
                                        <span className="text-gray-100 font-bold">{remainingHP}</span>
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto text-sm">
                                    <Card card={def} isInTradeRow={false} inPlayerHand={true}/>
                                </div>
                                <button 
                                    className="mt-2 w-full border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-3 py-2 rounded-lg font-semibold transition-all"
                                >
                                    🗑 Destroy
                                </button>
                            </div>
                        );
                    })}
                </div>
                {targetBases.length === 0 && (
                    <p className="text-gray-400 mb-4 text-center">No bases to destroy</p>
                )}
                {activePrompt.optional && (
                    <button 
                        onClick={skip} 
                        className="border-2 border-gray-500 bg-gray-800/40 hover:bg-gray-700/60 text-gray-300 px-4 py-2 rounded-lg font-semibold transition-all w-full"
                    >
                        Skip
                    </button>
                )}
            </div>
        </div>
    );
}