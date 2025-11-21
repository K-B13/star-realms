import { GameState } from "../engine/state";
import { Event } from "../engine/events";
import { Prompt } from "./opponentChoiceOverlay";
import Card from "../game/reusableComponents/card";
import { cardRegistry } from "../engine/cards";
import { factionColor } from "../game/page";

interface ChooseCardToCopyProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

export default function ChooseCardToCopyOverlay({ state, activePrompt, append }: ChooseCardToCopyProps) {
    const isOpen =
    activePrompt?.t === 'PromptShown' &&
    activePrompt.kind === 'chooseInPlayShip';

    if (!isOpen) return null;

    const p = state.order[state.activeIndex];
    const playedThisTurn = state.turn.playedThisTurn;
    
    const choose = (idx: number) => {
      append({ t:'TargetCardChosen', player: p, source: 'copyShip', inPlayIndex: idx });
    };
    const skip = () =>
        append({ t: 'PromptCancelled' });  

    return (
        <div>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
                    <h3 className="text-lg font-semibold mb-3">Choose a card to copy</h3>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {
                      playedThisTurn.map((card, idx) => {
                        const cardDef = cardRegistry[card];
                        if (idx === playedThisTurn.length - 1)
                            return <button key={idx} onClick={skip}>Skip</button>
                        return <div className={`${factionColor[cardDef.faction]} pl-1 pr-1 border-solid border-2`} key={idx}>
                            <Card card={cardDef} isInTradeRow={false}/>
                            <button onClick={() => choose(idx)}>Copy</button>
                        </div>
                      })}
                    </div>
                </div>
            </div>
        </div>
    )
}