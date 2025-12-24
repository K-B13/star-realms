import { GameState } from "@/app/engine/state";

interface GameOverOverlayProps {
    state: GameState;
    onNewGame: () => void;
}

export default function GameOverOverlay({ state, onNewGame }: GameOverOverlayProps) {
    if (!state.gameOver || !state.winner) return null;

    const winner = state.players[state.winner];
    
    // Sort players by final placement:
    // Winner (eliminationOrder = 0) gets rank 1
    // Last to die (highest eliminationOrder) gets rank 2
    // First to die (eliminationOrder = 1) gets last rank
    const sortedPlayers = [...state.order].sort((a, b) => {
        const playerA = state.players[a];
        const playerB = state.players[b];
        
        // Winner always first
        if (playerA.id === state.winner) return -1;
        if (playerB.id === state.winner) return 1;
        
        // Among dead players, higher eliminationOrder (died later) ranks better
        return playerB.eliminationOrder - playerA.eliminationOrder;
    });

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-yellow-500 rounded-2xl shadow-2xl shadow-yellow-500/50 p-8 max-w-2xl w-full">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-yellow-400 mb-4">🏆 GAME OVER 🏆</h1>
                    <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border-2 border-yellow-500 rounded-xl p-6 mb-6">
                        <p className="text-3xl font-bold text-yellow-300 mb-2">{winner.id} WINS!</p>
                        <p className="text-xl text-gray-300">Authority: {winner.authority}</p>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-300 mb-3">Final Standings</h3>
                        <div className="space-y-2">
                            {sortedPlayers.map((pid, idx) => {
                                const player = state.players[pid];
                                const isWinner = pid === state.winner;
                                const rank = idx + 1;
                                
                                // Determine medal/emoji for top 3
                                let rankEmoji = '';
                                if (rank === 1) rankEmoji = '🥇';
                                else if (rank === 2) rankEmoji = '🥈';
                                else if (rank === 3) rankEmoji = '🥉';
                                
                                return (
                                    <div 
                                        key={pid}
                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                            isWinner 
                                                ? 'bg-yellow-900/40 border-2 border-yellow-500' 
                                                : rank === 2
                                                ? 'bg-gray-700/40 border border-gray-400'
                                                : rank === 3
                                                ? 'bg-orange-900/40 border border-orange-600'
                                                : 'bg-slate-800/40 border border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-gray-400">
                                                {rankEmoji || `#${rank}`}
                                            </span>
                                            <span className={`font-semibold ${
                                                isWinner ? 'text-yellow-300' : 
                                                rank === 2 ? 'text-gray-200' :
                                                rank === 3 ? 'text-orange-300' :
                                                'text-gray-400'
                                            }`}>
                                                {player.id}
                                            </span>
                                            {isWinner && <span className="text-yellow-400 text-sm">👑 Winner</span>}
                                        </div>
                                        <span className="text-gray-300">
                                            Authority: <span className="font-bold">{player.authority}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onNewGame}
                            className="border-2 border-green-500 bg-green-900/40 hover:bg-green-800/60 text-green-200 px-8 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 text-lg"
                        >
                            🎮 New Game
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="border-2 border-blue-500 bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 px-8 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 text-lg"
                        >
                            🏠 Main Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
