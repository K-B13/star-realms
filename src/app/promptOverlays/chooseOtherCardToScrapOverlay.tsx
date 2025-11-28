import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { cardRegistry } from "../engine/cards";
import { Prompt } from "./opponentChoiceOverlay";

interface ChooseOtherCardToScrapOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

type From = 'inPlay' | 'hand' | 'discard';

export default function ChooseOtherCardToScrapOverlay({ state, activePrompt, append, currentPlayer }: ChooseOtherCardToScrapOverlayProps ) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseOtherCardToScrap';
    if (!isOpen) return null;

    const currentPlayerDetails = state.players[currentPlayer];
    const optional = (activePrompt as Prompt)?.optional ?? true;
    const zones = (activePrompt as Prompt)?.data?.zones as From[] | undefined;

    const allowedZones: From[] = zones ?? ['inPlay', 'hand', 'discard'];
    const showInPlay = allowedZones.includes('inPlay');
    const showHand = allowedZones.includes('hand');
    const showDiscard = allowedZones.includes('discard');
    
    
  
    const ScrapChosenCard = (idx: number, cardId: string, from: From) => append({ t: 'CardScrapped', player: currentPlayer, from: from, placementIndex: idx, card: cardId });
  
    const skip = () =>
      append({ t: 'PromptCancelled' });
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-blue-500 p-4 rounded shadow-md max-w-lg w-full">
          <h3 className="text-lg font-semibold mb-3">
            {optional ? 'Choose a card to scrap' : 'You must scrap a card'}
          </h3>
          <div className="flex gap-2 flex-wrap mb-4">
            { showInPlay && <div className="flex flex-row">
                {currentPlayerDetails.inPlay.map((card, idx) => {
                  if (idx === currentPlayerDetails.inPlay.length - 1) return;
                  return (
                    <button key={idx} onClick={() => ScrapChosenCard(idx, card, 'inPlay')} className="px-3 py-1 bg-blue-500 rounded">
                      {cardRegistry[card].name}
                    </button>
                  )
                })}
              </div>
            }
            { showDiscard && <div className="flex flex-row">
                {currentPlayerDetails.discard.map((card, idx) => (
                    <button key={idx} onClick={() => ScrapChosenCard(idx, card, 'discard')} className="px-3 py-1 bg-gray-300 rounded">
                      {cardRegistry[card].name}
                    </button>
                ))}
              </div>
            }
            { showHand && <div className="flex flex-row">
                {currentPlayerDetails.hand.map((card, idx) => (
                    <button key={idx} onClick={() => ScrapChosenCard(idx, card, 'hand')} className="px-3 py-1 bg-gray-300 rounded">
                      {cardRegistry[card].name}
                    </button>
                ))}
              </div>
            }
            {optional && <button onClick={skip} className="px-3 py-1 bg-gray-300 rounded">Skip</button>}
          </div>
        </div>
      </div>
    );
  }