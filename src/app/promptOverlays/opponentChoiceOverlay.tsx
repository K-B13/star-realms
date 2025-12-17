import { GameState } from "../engine/state";
import { Event } from "../engine/events";

interface OpponentChoiceOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
    getPlayerName?: (uid: string) => string;
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

export default function OpponentChoiceOverlay({ state, activePrompt, append, currentPlayer, getPlayerName }: OpponentChoiceOverlayProps ) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'choosePlayer';
    if (!isOpen) return null;

    const purpose = (activePrompt as Prompt)?.data?.purpose ?? 'opponentDiscard';

    // Filter out current player and dead players
    const candidates = state.order.filter(pid => pid !== currentPlayer && !state.players[pid].isDead);

    const pick = (pid: string) =>
      append({ t: 'TargetChosen', player: currentPlayer, target: pid, purpose } as Event);

    const skip = () =>
        append({ t: 'PromptCancelled', kind: 'choosePlayer' });  
    
    // Determine what info to show based on purpose
    const isDestroyBase = purpose === 'destroyOpponentBase';
    const isDiscard = purpose === 'opponentDiscard';
    
    // Count total HP by shield type
    const countBaseHP = (playerId: string) => {
        const player = state.players[playerId];
        const whiteCircleHP = player.bases.reduce((acc, base) => {
            if (base.shield === 'normal') {
                return acc + (base.defence - base.damage);
            }
            return acc;
        }, 0);
        const blackCircleHP = player.bases.reduce((acc, base) => {
            if (base.shield === 'outpost') {
                return acc + (base.defence - base.damage);
            }
            return acc;
        }, 0);
        return { whiteCircleHP, blackCircleHP };
    };
    
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-lg w-full">
          <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Choose Target Player</h3>
          <p className="text-gray-300 text-sm mb-6 text-center">Select an opponent to target with this ability</p>
          <div className="flex gap-3 flex-wrap justify-center mb-4">
            {candidates.map((candidate, idx) => {
              const playerState = state.players[candidate];
              const handSize = playerState.hand.length;
              const { whiteCircleHP, blackCircleHP } = countBaseHP(candidate);
              
              return (
                <button 
                  key={idx} 
                  onClick={() => pick(candidate)} 
                  className="border-2 border-yellow-500 bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-200 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 flex flex-col items-center"
                >
                  <span>{getPlayerName ? getPlayerName(candidate) : candidate}</span>
                  {isDestroyBase && playerState.bases.length > 0 && (
                    <div className="flex gap-3 text-xs text-yellow-300 mt-1">
                      <span className="flex items-center gap-1">
                        <span className="text-gray-300">⚪</span>
                        <span>{whiteCircleHP}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-900">⚫</span>
                        <span>{blackCircleHP}</span>
                      </span>
                    </div>
                  )}
                  {isDestroyBase && playerState.bases.length === 0 && (
                    <span className="text-xs text-gray-400 mt-1">No bases</span>
                  )}
                  {isDiscard && (
                    <span className="text-xs text-yellow-300 mt-1">
                      {handSize} {handSize === 1 ? 'card' : 'cards'} in hand
                    </span>
                  )}
                </button>
              );
            })}
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