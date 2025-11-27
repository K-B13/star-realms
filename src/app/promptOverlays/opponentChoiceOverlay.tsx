import { GameState } from "../engine/state";
import { Event } from "../engine/events";

interface OpponentChoiceOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

type Options = {
    t: string;
    label: string;
    amount: number;
}

export interface Prompt {
    t: 'PromptShown';
    kind: string;
    optional?: boolean;
    data?: {
        purpose?: string;
        target?: string;
        card?: string;
        inPlayIndex?: number;
        options?: Options[];
        maxCards?: number;
        action?: 'discard' | 'scrap';
    };
}

export default function OpponentChoiceOverlay({ state, activePrompt, append, currentPlayer }: OpponentChoiceOverlayProps ) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'choosePlayer';
    if (!isOpen) return null;

    const purpose = (activePrompt as Prompt)?.data?.purpose ?? 'opponentDiscard';

    const candidates = state.order.filter(pid => pid !== currentPlayer);

    const pick = (pid: string) =>
      append({ t: 'TargetChosen', player: currentPlayer, target: pid, purpose } as Event);

    const skip = () =>
        append({ t: 'PromptCancelled' });  
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
          <h3 className="text-lg font-semibold mb-3">Choose a player</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {candidates.map((candidate, idx) => (
              <button key={idx} onClick={() => pick(candidate)} className="border px-3 py-2 rounded">
                Pick {candidate}
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