import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { Prompt } from "./opponentChoiceOverlay";

interface OpponentHandChoiceOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

// src/app/game/components/OpponentDiscardOverlay.tsx
export default function OpponentDiscardOverlay({ state, activePrompt, append, currentPlayer }: OpponentHandChoiceOverlayProps ) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'opponentDiscard';
    if (!isOpen) return null;
  
    // for now: only one opponent → pick the first PID that isn't current
    const target: string | undefined = (activePrompt as Prompt)?.data?.target;
    if (!target) return null;
  
    const handSize = state.players[target].hand.length;
    const discardOne = (idx: number) =>
      append({ t: 'CardDiscarded', player: target, card: state.players[target].hand[idx], rowIndex: idx });
  
    const skip = () =>
      append({ t: 'PromptCancelled' });
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
          <h3 className="text-lg font-semibold mb-3">Choose a card for the opponent to discard</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {Array.from({ length: handSize }).map((_, idx) => (
              <button key={idx} onClick={() => discardOne(idx)} className="border px-3 py-2 rounded">
                Card {idx + 1}
              </button>
            ))}
          </div>
          {activePrompt.optional && (
            <button onClick={skip} className="px-3 py-1 bg-gray-300 rounded">Skip</button>
          )}
        </div>
      </div>
    );
  }