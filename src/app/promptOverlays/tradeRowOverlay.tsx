import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { cardRegistry } from "../engine/cards";

interface RowChoiceOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    handleFunction: (idx: number, card: string, currentPlayer: string) => void;
}

export default function ScrapPromptOverlay({ state, activePrompt, append, handleFunction }: RowChoiceOverlayProps) {


    const handleSkip = () => {
        append({ t: 'PromptCancelled' })
    }

    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapRow'
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Scrap Trade Row Card</h3>
            <p className="text-gray-300 text-sm mb-6 text-center">Choose a card from the trade row to scrap</p>
            <div className="flex gap-3 flex-wrap justify-center mb-4">
              {state.row.map((card: string, idx: number) => {
                const empty = !card;
                return (
                  <button
                    key={idx}
                    disabled={empty}
                    onClick={() => !empty && handleFunction(idx, card, state.order[state.activeIndex])}
                    className="border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-4 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-900/40"
                    title={empty ? "Empty slot" : cardRegistry[card].name}
                  >
                    {empty ? "Empty" : cardRegistry[card].name}
                  </button>
                );
              })}
            </div>
            {activePrompt.optional && (
              <button 
                onClick={handleSkip} 
                className="border-2 border-gray-500 bg-gray-800/40 hover:bg-gray-700/60 text-gray-300 px-4 py-2 rounded-lg font-semibold transition-all w-full"
              >
                Skip
              </button>
            )}
          </div>
        </div>
    )
}