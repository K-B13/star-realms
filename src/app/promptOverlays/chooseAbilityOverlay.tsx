import { cardRegistry } from "../engine/cards";
import { Event } from "../engine/events";
import { GameState } from "../engine/state";
import { Prompt } from "./opponentChoiceOverlay";

interface ChooseAbilityOverlayProps {
    state: GameState;
    activePrompt: Event;
    append: (event: Event | Event[]) => void;
    currentPlayer: string;
}

type AbilitiesAllowed = 'TradeAdded' | 'CombatAdded' | 'AuthorityAdded';

export default function ChooseAbilityOverlay({ state, activePrompt, append, currentPlayer }: ChooseAbilityOverlayProps) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseAbility';
        if (!isOpen) return null;
    
        const cardId = (activePrompt as Prompt).data!.card as string;
        const card = cardRegistry[cardId];
        
      
        const chooseAbility = (ability: { t: AbilitiesAllowed, amount: number }) => {
            return append({ t: ability.t, player: currentPlayer, amount: ability.amount });
        };
      
        const skip = () =>
          append({ t: 'PromptCancelled' });
      
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-blue p-4 rounded shadow-md max-w-lg w-full">
              <h3 className="text-lg font-semibold mb-3">Choose an ability</h3>
              <div className="flex gap-2 flex-wrap mb-4">
                {
                    (activePrompt as Prompt).data!.options!.map((option, idx) => {
                        return (
                            <button key={idx} onClick={() => chooseAbility({ t: option.t as AbilitiesAllowed, amount: option.amount })} className="border px-3 py-2 rounded">
                                {option.label}
                            </button>
                        )
                    })
                }
              </div>
            </div>
          </div>
        );
}