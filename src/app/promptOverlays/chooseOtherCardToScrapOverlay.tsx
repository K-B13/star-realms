import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { cardRegistry, Faction } from "../engine/cards";
import { Prompt } from "./opponentChoiceOverlay";
import Card from "../game/reusableComponents/card";

interface ChooseOtherCardToScrapOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

type From = 'inPlay' | 'hand' | 'discard';

const factionColors: Record<Faction, { border: string, bg: string }> = {
    "Trade Federation": { border: "border-blue-400", bg: "bg-blue-900/40" },
    "Blob Faction": { border: "border-green-400", bg: "bg-green-900/40" },
    "Machine Cult": { border: "border-red-400", bg: "bg-red-900/40" },
    "Star Empire": { border: "border-yellow-400", bg: "bg-yellow-900/40" },
    "Neutral": { border: "border-gray-400", bg: "bg-gray-800/40" },
};

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
    
    
  
    const ScrapChosenCard = (idx: number, cardId: string, from: From) => append({ t: 'CardScrapped', player: currentPlayer, from: from, placementIndex: idx, card: cardId, timestamp: Date.now() });
  
    const skip = () =>
      append({ t: 'PromptCancelled', kind: 'chooseOtherCardToScrap', timestamp: Date.now() });
  
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">
            {optional ? 'Scrap a Card' : 'You Must Scrap a Card'}
          </h3>
          <p className="text-gray-300 text-sm mb-6 text-center">Choose a card from your zones to scrap</p>
          <div className="flex flex-col gap-4 mb-4">
            { showInPlay && currentPlayerDetails.inPlay.length > 1 && (
              <div>
                <p className="text-cyan-300 text-sm font-semibold mb-3">Played This Turn:</p>
                <div className="flex gap-3 flex-wrap">
                  {currentPlayerDetails.inPlay.map((card, idx) => {
                    if (idx === currentPlayerDetails.inPlay.length - 1) return null;
                    const cardDef = cardRegistry[card];
                    const colors = factionColors[cardDef.faction];
                    return (
                      <div 
                        key={idx} 
                        onClick={() => ScrapChosenCard(idx, card, 'inPlay')} 
                        className={`border-3 ${colors.border} rounded-xl ${colors.bg} p-3 w-48 h-64 cursor-pointer hover:brightness-125 transition-all shadow-lg hover:shadow-xl flex flex-col`}
                      >
                        <div className="flex-1 overflow-y-auto text-sm">
                          <Card card={cardDef} isInTradeRow={false} />
                        </div>
                        <button className="mt-2 w-full border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-3 py-2 rounded-lg font-semibold transition-all">
                          🗑 Scrap
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            { showDiscard && currentPlayerDetails.discard.length > 0 && (
              <div>
                <p className="text-emerald-300 text-sm font-semibold mb-3">Discard:</p>
                <div className="flex gap-3 flex-wrap">
                  {currentPlayerDetails.discard.map((card, idx) => {
                    const cardDef = cardRegistry[card];
                    const colors = factionColors[cardDef.faction];
                    return (
                      <div 
                        key={idx} 
                        onClick={() => ScrapChosenCard(idx, card, 'discard')} 
                        className={`border-3 ${colors.border} rounded-xl ${colors.bg} p-3 w-48 h-64 cursor-pointer hover:brightness-125 transition-all shadow-lg hover:shadow-xl flex flex-col`}
                      >
                        <div className="flex-1 overflow-y-auto text-sm">
                          <Card card={cardDef} isInTradeRow={false} />
                        </div>
                        <button className="mt-2 w-full border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-3 py-2 rounded-lg font-semibold transition-all">
                          🗑 Scrap
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            { showHand && currentPlayerDetails.hand.length > 0 && (
              <div>
                <p className="text-yellow-300 text-sm font-semibold mb-3">Hand:</p>
                <div className="flex gap-3 flex-wrap">
                  {currentPlayerDetails.hand.map((card, idx) => {
                    const cardDef = cardRegistry[card];
                    const colors = factionColors[cardDef.faction];
                    return (
                      <div 
                        key={idx} 
                        onClick={() => ScrapChosenCard(idx, card, 'hand')} 
                        className={`border-3 ${colors.border} rounded-xl ${colors.bg} p-3 w-48 h-64 cursor-pointer hover:brightness-125 transition-all shadow-lg hover:shadow-xl flex flex-col`}
                      >
                        <div className="flex-1 overflow-y-auto text-sm">
                          <Card card={cardDef} isInTradeRow={false} />
                        </div>
                        <button className="mt-2 w-full border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-3 py-2 rounded-lg font-semibold transition-all">
                          🗑 Scrap
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          {optional && (
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