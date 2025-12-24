import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { cardRegistry, Faction } from "../engine/cards";
import Card from "../game/reusableComponents/card";

interface RowChoiceOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    handleFunction: (idx: number, card: string, currentPlayer: string) => void;
}

const factionColors: Record<Faction, { border: string, bg: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40" },
};

export default function ScrapPromptOverlay({ state, activePrompt, append, handleFunction }: RowChoiceOverlayProps) {


    const handleSkip = () => {
        append({ t: 'PromptCancelled', kind: 'scrapRow', timestamp: Date.now() })
    }

    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapRow'
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Scrap Trade Row Card</h3>
            <p className="text-gray-300 text-sm mb-6 text-center">Choose a card from the trade row to scrap</p>
            <div className="flex gap-3 flex-wrap justify-center mb-4">
              {state.row.map((card: string, idx: number) => {
                const empty = !card;
                if (empty) {
                  return (
                    <div
                      key={idx}
                      className="border-3 border-gray-600 rounded-xl bg-gray-900/40 p-3 w-48 h-64 flex items-center justify-center opacity-30"
                    >
                      <p className="text-gray-500 font-semibold">Empty Slot</p>
                    </div>
                  );
                }
                const cardDef = cardRegistry[card];
                const colors = factionColors[cardDef.faction];
                return (
                  <div
                    key={idx}
                    onClick={() => handleFunction(idx, card, state.order[state.activeIndex])}
                    className={`border-3 ${colors.border} rounded-xl ${colors.bg} p-3 w-48 h-64 cursor-pointer hover:brightness-125 transition-all shadow-lg hover:shadow-xl flex flex-col`}
                  >
                    <div className="flex-1 overflow-y-auto text-sm">
                      <Card card={cardDef} isInTradeRow={true} />
                    </div>
                    <button className="mt-2 w-full border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-3 py-2 rounded-lg font-semibold transition-all">
                      🗑 Scrap
                    </button>
                  </div>
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