import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { Prompt } from "./opponentChoiceOverlay";
import { cardRegistry } from "../engine/cards";

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
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Destroy Opponent Base</h3>
                <p className="text-gray-300 text-sm mb-6 text-center">Choose a base to destroy from {target}&apos;s bases</p>
                <div className="flex gap-3 flex-wrap justify-center mb-4">
                    {targetBases.map((base, idx) => {
                        const def = cardRegistry[base.id];
                        return (
                            <button
                                key={idx}
                                onClick={() => destroyBase(idx)}
                                className="border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-5 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                            >
                                {def.name}<br/>
                                <span className="text-xs">({base.defence - base.damage} HP)</span>
                            </button>
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