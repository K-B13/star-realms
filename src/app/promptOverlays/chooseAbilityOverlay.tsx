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
          append({ t: 'PromptCancelled', kind: 'chooseAbility', timestamp: Date.now() });
      
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-3 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold mb-4 text-purple-300 text-center">Choose an Ability</h3>
              <p className="text-gray-300 text-sm mb-6 text-center">Select which effect you want to activate</p>
              <div className="flex gap-3 flex-wrap justify-center">
                {
                    (activePrompt as Prompt).data!.options!.map((option, idx) => {
                        return (
                            <button 
                              key={idx} 
                              onClick={() => chooseAbility(option)} 
                              className="border-2 border-cyan-500 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                            >
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