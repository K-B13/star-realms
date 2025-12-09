import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { Prompt } from "./opponentChoiceOverlay";
import { cardRegistry } from "../engine/cards";

interface ChooseToScrapOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}


export default function ChooseToScrapOverlay({ state, activePrompt, append, currentPlayer }: ChooseToScrapOverlayProps) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapSelf';
    if (!isOpen) return null;

    const inPlayIndex = (activePrompt as Prompt).data!.inPlayIndex as number;
    const cardId = (activePrompt as Prompt).data!.card as string;
    const card = cardRegistry[cardId];
    
  
    const scrapGivenCard = () => append({ t: 'CardScrapped', player: currentPlayer, from: 'inPlay', placementIndex: inPlayIndex, card: cardId });
  
    const skip = () =>
      append({ t: 'PromptCancelled', kind: 'scrapSelf' });
  
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-lg w-full">
          <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Scrap {card.name}?</h3>
          <p className="text-gray-300 text-sm mb-6 text-center">This card has a scrap ability. Do you want to scrap it for its bonus effect?</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => scrapGivenCard()} 
              className="border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
            >
              🗑 Scrap Card
            </button>
            <button 
              onClick={skip} 
              className="border-2 border-cyan-500 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              Keep It
            </button>
          </div>
        </div>
      </div>
    );
  }