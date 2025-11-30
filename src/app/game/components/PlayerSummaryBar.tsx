import { PlayerState } from "@/app/engine/state";

interface PlayerSummaryBarProps {
    players: Record<string, PlayerState>;
    playerOrder: string[];
    currentPlayerId: string;
}

export default function PlayerSummaryBar({ players, playerOrder, currentPlayerId }: PlayerSummaryBarProps) {
    // Filter out current player from summary
    const otherPlayers = playerOrder.filter(pid => pid !== currentPlayerId);

    // Count bases by shield type
    const countBases = (playerId: string) => {
        const player = players[playerId];
        const silverShields = player.bases.filter(b => b.shield === 'normal').length;
        const blackShields = player.bases.filter(b => b.shield === 'outpost').length;
        return { silverShields, blackShields };
    };

    return (
        <div className="flex gap-2.5 justify-center">
            {otherPlayers.map((pid) => {
                const player = players[pid];
                const { silverShields, blackShields } = countBases(pid);
                
                return (
                    <div key={pid} className="w-48 border-3 border-blue-500 rounded-xl bg-slate-700 p-2.5 shadow-lg shadow-blue-500/20">
                        <p className="text-sm font-bold text-yellow-400 mb-1">{player.id}</p>
                        <p className="text-xs text-gray-200">Authority: {player.authority}</p>
                        <p className="text-xs text-gray-200">Silver: {silverShields}</p>
                        <p className="text-xs text-gray-200">Black: {blackShields}</p>
                    </div>
                );
            })}
        </div>
    );
}
