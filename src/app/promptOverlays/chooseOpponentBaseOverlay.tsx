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
        append({ t: 'PromptCancelled' });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
                <h3 className="text-lg font-semibold mb-3">Choose a base to destroy</h3>
                <div className="flex gap-2 flex-wrap mb-4">
                    {targetBases.map((base, idx) => {
                        const def = cardRegistry[base.id];
                        return (
                            <button
                                key={idx}
                                onClick={() => destroyBase(idx)}
                                className="border px-3 py-2 rounded hover:bg-gray-100"
                            >
                                {def.name} ({base.defence - base.damage} HP)
                            </button>
                        );
                    })}
                </div>
                {targetBases.length === 0 && (
                    <p className="text-gray-500 mb-4">No bases to destroy</p>
                )}
                {activePrompt.optional && (
                    <button onClick={skip} className="px-3 py-1 bg-gray-300 rounded">Skip</button>
                )}
            </div>
        </div>
    );
}