'use client'
import { lobbyPath } from "@/app/firebase/firebasePaths"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { auth, db } from "@/app/firebase/firebaseConfig"
import { onValue, ref } from "firebase/database"
import { LobbyInterface } from "@/app/lobbyCreation/page"
import { OnlinePlayer } from "@/app/onlineLandingPage/onlineNameCreation"
import { updateValue } from "@/app/firebase/firebaseActions"


export default function Lobby() {
    const params = useParams()
    const hostUid = params.uid as string
    const [lobby, setLobby] = useState<LobbyInterface | null>(null)
    const [ showLobbySettings, setShowLobbySettings ] = useState(true)

    useEffect(() => {
        const unsubscribe = onValue(ref(db, lobbyPath(hostUid)), (snapshot) => {
            const lobby = snapshot.val()
            setLobby(lobby)
        })
        return () => unsubscribe()
    }, [hostUid])

    const handleReady = async () => {
        const uid = auth.currentUser?.uid
        if (!uid || !lobby) return;
        
        const currentPlayer = lobby.players[uid]
        if (!currentPlayer) return;

        const updatedPlayer = { ...currentPlayer, ready: !currentPlayer.ready }
        await updateValue(lobbyPath(hostUid), { players: { ...lobby.players, [uid]: updatedPlayer } })
    }

    const checkAllReady = () => {
        if (!lobby) return false;
        const players = Object.values(lobby.players)
        return players.every(player => player.ready)
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
            <div className="w-full max-w-6xl">
                <div className="border-4 border-cyan-400 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl shadow-cyan-500/20">
                    <h1 className="text-4xl font-bold text-cyan-300 mb-8 text-center">{lobby?.lobbyName}</h1>
                    
                    <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

                        <div className="lg:hidden flex-shrink-0">
                            <button 
                                onClick={() => setShowLobbySettings(!showLobbySettings)}
                                className="w-full px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-400 rounded-xl transition-colors flex items-center justify-between"
                            >
                                <h3 className="text-lg font-bold text-purple-300">Lobby Settings</h3>
                                <span className={`text-2xl text-purple-300 transition-transform duration-300 ${showLobbySettings ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                showLobbySettings ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="border-3 border-purple-400 rounded-2xl bg-slate-700/30 p-6 space-y-4">
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg">
                                            <span className="font-semibold">Players</span>
                                            <span className="text-cyan-300 font-bold">{lobby ? Object.keys(lobby.players).length : 0} / {lobby?.lobbyLimit || 6}</span>
                                        </div>
                                        
                                        {lobby?.expansionPacks && lobby.expansionPacks.length > 0 && (
                                            <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
                                                <p className="font-semibold mb-2">Expansion Packs</p>
                                                {lobby.expansionPacks.map((pack, idx) => (
                                                    <p key={idx} className="text-sm text-gray-400 ml-2">• {pack}</p>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg">
                                            <span className="font-semibold">Mode</span>
                                            <span className="text-cyan-300 font-bold">{lobby?.gameMode}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg">
                                            <span className="font-semibold">Password</span>
                                            <span className={`font-bold ${lobby?.hasPassword ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {lobby?.hasPassword ? '🔒 Protected' : '🔓 Open'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <button className="w-full px-6 py-3 rounded-xl border-2 border-red-500 bg-red-900/30 text-red-300 hover:bg-red-900/50 transition-colors font-semibold">
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                        <div className="hidden lg:flex flex-shrink-0">
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                showLobbySettings ? 'w-[300px] opacity-100' : 'w-0 opacity-0'
                            }`}>
                                <div className="w-[300px] border-3 border-purple-400 rounded-2xl bg-slate-700/30 p-6 space-y-4 flex-shrink-0">
                                    <h3 className="text-2xl font-bold text-purple-300 mb-6 text-center">Lobby Settings</h3>
                                    
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg">
                                            <span className="font-semibold">Players</span>
                                            <span className="text-cyan-300 font-bold">{lobby ? Object.keys(lobby.players).length : 0} / {lobby?.lobbyLimit || 6}</span>
                                        </div>
                                        
                                        {lobby?.expansionPacks && lobby.expansionPacks.length > 0 && (
                                            <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
                                                <p className="font-semibold mb-2">Expansion Packs</p>
                                                {lobby.expansionPacks.map((pack, idx) => (
                                                    <p key={idx} className="text-sm text-gray-400 ml-2">• {pack}</p>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg">
                                            <span className="font-semibold">Mode</span>
                                            <span className="text-cyan-300 font-bold">{lobby?.gameMode}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg">
                                            <span className="font-semibold">Password</span>
                                            <span className={`font-bold ${lobby?.hasPassword ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {lobby?.hasPassword ? '🔒 Protected' : '🔓 Open'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <button className="w-full px-6 py-3 rounded-xl border-2 border-red-500 bg-red-900/30 text-red-300 hover:bg-red-900/50 transition-colors font-semibold">
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setShowLobbySettings(!showLobbySettings)}
                                className="h-fit px-2 py-8 bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-400 rounded-xl transition-colors flex items-center justify-center ml-2 flex-shrink-0"
                            >
                                <span className={`text-2xl text-purple-300 transition-transform duration-300 ${showLobbySettings ? '' : 'rotate-180'}`}>
                                    ◀
                                </span>
                            </button>
                        </div>

                        <div className="border-3 border-purple-400 rounded-2xl bg-slate-700/30 p-6 flex-1">
                            <div className="space-y-3 mb-6">
                                {lobby && Object.values(lobby.players).map((player: OnlinePlayer) => (
                                    <div 
                                        key={player.uid}
                                        className="flex items-center justify-between px-6 py-4 bg-slate-800/50 rounded-xl border-2 border-purple-400/50 hover:border-cyan-400/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="text-xl font-bold text-gray-100">
                                                {player.name}
                                            </span>
                                            {player.host && (
                                                <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-400 rounded-lg text-yellow-300 text-sm font-semibold">
                                                    Host
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {player.ready && (
                                                <span className="text-green-400 font-semibold">Ready</span>
                                            )}
                                            {player.uid === auth.currentUser?.uid && <div onClick={handleReady} className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                                player.ready 
                                                    ? 'bg-green-500 border-green-400' 
                                                    : 'bg-slate-700 border-purple-400'
                                            } flex items-center justify-center`}>
                                                {player.ready && (
                                                    <svg 
                                                        className="w-5 h-5 text-white"
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {
                                lobby && Object.keys(lobby.players).length > 1 && checkAllReady() && <div className="pt-4">
                                    <button className="w-full px-8 py-4 rounded-xl border-3 border-cyan-400 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xl font-bold hover:from-cyan-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50">
                                        Start
                                    </button>
                                </div>
                            }
                            <button onClick={() => console.log(lobby)}>Log</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}