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


export default function ChooseToScrapOverlay({ state, activePrompt, append, currentPlayer }: ChooseToScrapOverlayProps ) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapSelf';
    if (!isOpen) return null;

    const inPlayIndex = (activePrompt as Prompt).data!.inPlayIndex as number;
    const cardId = (activePrompt as Prompt).data!.card as string;
    const card = cardRegistry[cardId];
    
  
    const scrapGivenCard = () => append({ t: 'CardScrapped', player: currentPlayer, from: 'inPlay', placementIndex: inPlayIndex, card: cardId });
  
    const skip = () =>
      append({ t: 'PromptCancelled' });
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
          <h3 className="text-lg font-semibold mb-3">Do you also want to scrap {card.name}</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            <button onClick={() => scrapGivenCard()} className="border px-3 py-2 rounded">
              Scrap Card
            </button>
            <button onClick={skip} className="px-3 py-1 bg-gray-300 rounded">Keep It</button>
          </div>
        </div>
      </div>
    );
  }