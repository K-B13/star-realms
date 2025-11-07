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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-3">Scrap a trade-row card?</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {state.row.map((card: string, idx: number) => {
                const empty = !card;
                return (
                  <button
                    key={idx}
                    disabled={empty}
                    onClick={() => !empty && handleFunction(idx, card, state.order[state.activeIndex])}
                    className="border px-2 py-1 rounded disabled:opacity-50"
                    title={empty ? "Empty slot" : cardRegistry[card].name}
                  >
                    {empty ? "—" : cardRegistry[card].name}
                  </button>
                );
              })}
            </div>
            {activePrompt.optional && (
              <button onClick={handleSkip} className="px-3 py-1 bg-gray-300 rounded">Skip</button>
            )}
          </div>
        </div>
    )
}