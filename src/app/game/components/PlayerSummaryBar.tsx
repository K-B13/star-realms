import { PlayerState } from "@/app/engine/state";
import { Event } from "@/app/engine/events";

interface PlayerSummaryBarProps {
    players: Record<string, PlayerState>;
    playerOrder: string[];
    currentPlayerId: string;
    append: (event: Event | Event[]) => void;
}

export default function PlayerSummaryBar({ players, playerOrder, currentPlayerId, append }: PlayerSummaryBarProps) {
    // Filter out current player from summary
    const otherPlayers = playerOrder.filter(pid => pid !== currentPlayerId);

    // Count bases by shield type
    const countBases = (playerId: string) => {
        const player = players[playerId];
        const silverShields = player.bases.reduce((acc, base) => {
            if (base.shield === 'normal') {
                const leftoverShield = base.defence - base.damage
                return acc + leftoverShield
            }
            return acc
        }, 0);
        const blackShields = player.bases.reduce((acc, base) => {
            if (base.shield === 'outpost') {
                const leftoverShield = base.defence - base.damage
                return acc + leftoverShield
            }
            return acc
        }, 0);
        return { silverShields, blackShields };
    };

    const currentPlayer = players[currentPlayerId];
    const hasOutpost = (playerId: string) => {
        return players[playerId].bases.some(base => base.shield === 'outpost');
    };

    return (
        <div className="flex gap-2.5 justify-center">
            {otherPlayers.map((pid) => {
                const player = players[pid];
                const { silverShields, blackShields } = countBases(pid);
                const canAttackDirectly = !hasOutpost(pid) && currentPlayer.combat > 0;
                
                return (
                    <div key={pid} className="w-48 h-28 border-3 border-blue-500 rounded-xl bg-slate-700 p-2.5 shadow-lg shadow-blue-500/20 flex flex-col">
                        <div className="text-center">
                            <p className="text-sm font-bold text-yellow-400 mb-1">{player.id}</p>
                            <p className="text-xs text-gray-200 mb-1">Authority: {player.authority}</p>
                            <div className="flex gap-3 text-xs text-gray-200 justify-center">
                                <span className="flex items-center gap-1">
                                    <span className="text-gray-300">⚪</span> {silverShields}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="text-gray-900">⚫</span> {blackShields}
                                </span>
                            </div>
                        </div>
                        {canAttackDirectly && (
                            <button 
                                onClick={() => append({ t: 'DamageDealt', from: currentPlayerId, to: pid, amount: currentPlayer.combat })}
                                className="border border-orange-500 bg-orange-900/80 hover:bg-orange-800 text-orange-200 px-2 py-1 rounded-lg text-xs font-semibold transition-all shadow-md mt-auto mb-2"
                            >
                                ⚔️ Attack ({currentPlayer.combat})
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
