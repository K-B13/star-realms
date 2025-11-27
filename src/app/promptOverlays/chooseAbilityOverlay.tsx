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

export default function ChooseAbilityOverlay({ state, activePrompt, append, currentPlayer }: ChooseAbilityOverlayProps) {
    const isOpen = activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseAbility';
        if (!isOpen) return null;
      
        const chooseAbility = (option: Record<string, (string | number)>) => {
          return append({ ...option, player: currentPlayer } as Event);
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
                            <button key={idx} onClick={() => chooseAbility(option)} className="border px-3 py-2 rounded">
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