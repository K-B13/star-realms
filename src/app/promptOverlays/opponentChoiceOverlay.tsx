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
        zones?: ('inPlay' | 'discard' | 'hand')[];
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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-lg w-full">
          <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Choose Target Player</h3>
          <p className="text-gray-300 text-sm mb-6 text-center">Select an opponent to target with this ability</p>
          <div className="flex gap-3 flex-wrap justify-center mb-4">
            {candidates.map((candidate, idx) => (
              <button 
                key={idx} 
                onClick={() => pick(candidate)} 
                className="border-2 border-yellow-500 bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-200 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40"
              >
                {candidate}
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