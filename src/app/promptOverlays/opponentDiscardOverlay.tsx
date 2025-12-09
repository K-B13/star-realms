import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { Prompt } from "./opponentChoiceOverlay";

interface OpponentHandChoiceOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

export default function OpponentDiscardOverlay({ state, activePrompt, append, currentPlayer }: OpponentHandChoiceOverlayProps ) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'opponentDiscard';
    if (!isOpen) return null;
  
    const target: string | undefined = (activePrompt as Prompt)?.data?.target;
    if (!target) return null;
  
    const handSize = state.players[target].hand.length;
    const discardOne = (idx: number) =>
      append({ t: 'CardDiscarded', player: target, card: state.players[target].hand[idx], rowIndex: idx });
  
    const skip = () =>
      append({ t: 'PromptCancelled', kind: 'opponentDiscard' });
  
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-lg w-full">
          <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Opponent Discard</h3>
          <p className="text-gray-300 text-sm mb-6 text-center">{target} must discard a card. Choose which card position.</p>
          <div className="flex gap-3 flex-wrap justify-center mb-4">
            {Array.from({ length: handSize }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => discardOne(idx)}
                className="border-2 border-orange-500 bg-orange-900/40 hover:bg-orange-800/60 text-orange-200 px-5 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
              >
                Card {idx + 1}
              </button>
            ))}
          </div>
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