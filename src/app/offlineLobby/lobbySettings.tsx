import { useState } from "react";
import { GameData, Player } from "./page";
import Link from "next/link";

export default function LobbySettings({ gameData, players }: { gameData: GameData, players: Player[] }) {
    const [ showPassword, setShowPassword ] = useState(false)
    return (
        <div className="w-1/3 border-4 border-purple-500 rounded-3xl p-5 flex flex-col justify-between bg-gradient-to-b from-slate-700 to-slate-800 shadow-lg shadow-purple-500/30">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-purple-300">Lobby Settings</h2>
                <p className="text-lg text-gray-200">Players {players.length}/6</p>
                <p className="text-lg text-gray-300">Expansion Pack 1</p>
                <p className="text-lg text-gray-300">Expansion Pack 2</p>
                <p className="text-lg text-gray-200">{gameData.type}</p>
                <p className="text-lg text-gray-200">{gameData.password ? 'Has Password' : 'No Password'}</p>
                {gameData.password && (
                    <>
                        <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-cyan-400 underline text-base hover:text-cyan-300 transition-colors"
                        >
                            {showPassword ? 'Hide' : 'Show'} Password
                        </button>
                        {showPassword && <p className="text-base text-gray-200">{gameData.password}</p>}
                    </>
                )}
            </div>
            <Link 
                href="/"
                className="border-4 border-red-500 rounded-2xl px-6 py-2.5 text-xl font-bold text-center text-red-300 hover:bg-red-900/30 transition-colors shadow-lg shadow-red-500/20"
            >
                Go Back
            </Link>
        </div>
    )
}