'use client'
import Players from "./players"
import Link from "next/link"
import { Player } from "./page"

export default function PlayersContainer({ 
    players, 
    createNewPlayer, 
    handlePlayerChange,
    removePlayer,
    getAvailableColors
}: { 
    players: Player[], 
    createNewPlayer: () => void, 
    handlePlayerChange: (idx: number, playerData: Player) => void,
    removePlayer: (idx: number) => void,
    getAvailableColors: (currentPlayerIndex: number) => string[]
}) {

    return (
        <div className="flex-1 border-4 border-cyan-500 rounded-3xl p-5 flex flex-col bg-gradient-to-b from-slate-700 to-slate-800 shadow-lg shadow-cyan-500/30">
            <div className="flex-1 space-y-3 mb-4">
                {players.map((player, idx) => {
                    return (
                        <Players 
                            key={player.id} 
                            playerData={player} 
                            colourOptions={getAvailableColors(idx)} 
                            position={idx} 
                            handlePlayerChange={handlePlayerChange}
                            removePlayer={removePlayer}
                            showRemove={!player.host}
                        />
                    )
                })}
                
                {players.length < 6 && (
                    <button 
                        onClick={createNewPlayer}
                        className="border-4 border-emerald-500 rounded-2xl px-6 py-2 text-xl font-bold text-emerald-300 hover:bg-emerald-900/30 transition-colors w-full max-w-xs mx-auto block shadow-lg shadow-emerald-500/20"
                    >
                        Add New Player
                    </button>
                )}
            </div>

            {players.length > 1 && (
                <Link 
                    href={`/new-game?players=${encodeURIComponent(JSON.stringify(players))}`}
                    className="border-4 border-yellow-500 rounded-2xl px-6 py-3 text-2xl font-bold text-center text-yellow-300 hover:bg-yellow-900/30 transition-colors block shadow-lg shadow-yellow-500/20"
                >
                    Start
                </Link>
            )}
        </div>
    )
}