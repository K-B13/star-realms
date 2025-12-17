'use client'
import { onValue, ref } from "firebase/database"
import { useState, useEffect } from "react"
import { allLobbyPath, lobbyPath, playerLobbyPath, playerPath } from "../firebase/firebasePaths"
import { auth, db } from "../firebase/firebaseConfig"
import { LobbyInterface } from "../lobbyCreation/page"
import { useRouter } from "next/navigation"
import { getValue, writeValue } from "../firebase/firebaseActions"
import { OnlinePlayer } from "../onlineLandingPage/onlineNameCreation"

export default function LobbySelection() {
    const router = useRouter()
    const [allLobbies, setAllLobbies] = useState<LobbyInterface[]>([])
    const [passwordInput, setPasswordInput] = useState<{ [key: string]: string }>({})
    const [showPasswordFor, setShowPasswordFor] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = onValue(ref(db, allLobbyPath()), (snapshot) => {
            const snapshotData = snapshot.val()
            if (snapshotData) {
                const lobbies = Object.values(snapshotData) as LobbyInterface[]
                setAllLobbies(lobbies)
            } else {
                setAllLobbies([])
            }
        })
        return () => unsubscribe()
    }, [])

    const handleJoinLobby = async (lobby: LobbyInterface) => {
        if (lobby.hasPassword) {
            const enteredPassword = passwordInput[lobby.hostUid]
            if (enteredPassword === lobby.lobbyPassword) {
                await addPlayerToLobby(lobby.hostUid)
                router.push(`/lobby/${lobby.hostUid}`)
            } else {
                alert('Incorrect password!')
            }
        } else {
            await addPlayerToLobby(lobby.hostUid)
            router.push(`/lobby/${lobby.hostUid}`)
        }
    }

    const addPlayerToLobby = async (lobbyUid: string) => {
        const uid = auth.currentUser?.uid
        if (!uid) return;
        const playerData = (await getValue(playerPath(uid))).val()
        const newPlayer: OnlinePlayer = {
            name: playerData.name,
            ready: false,
            uid,
            host: false
        }
        await writeValue(playerLobbyPath(lobbyUid, uid), newPlayer)
    }

    const togglePasswordInput = (hostUid: string) => {
        setShowPasswordFor(showPasswordFor === hostUid ? null : hostUid)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
                <div className="border-4 border-cyan-400 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl shadow-cyan-500/20">
                    <h1 className="text-4xl font-bold text-cyan-300 mb-8 text-center">Lobby Selection</h1>
                    
                    <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                        {allLobbies.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-lg">No lobbies available</p>
                            </div>
                        ) : (
                            allLobbies.map((lobby) => (
                                <div 
                                    key={lobby.hostUid}
                                    className="border-3 border-purple-400 rounded-2xl bg-slate-700/30 p-6 hover:border-cyan-400/50 transition-colors"
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-cyan-300 mb-2">
                                                    {lobby.lobbyName} - {lobby.hostName}
                                                </h2>
                                                <div className="space-y-1 text-gray-300">
                                                    <p className="text-lg">
                                                        <span className="font-semibold">Players:</span>{' '}
                                                        <span className="text-cyan-300 font-bold">
                                                            {Object.keys(lobby.players).length}/{lobby.lobbyLimit}
                                                        </span>
                                                    </p>
                                                    <p className="text-lg">
                                                        <span className="font-semibold">Mode:</span>{' '}
                                                        <span className="text-purple-300 font-bold">{lobby.gameMode}</span>
                                                    </p>
                                                    {lobby.hasPassword && (
                                                        <p className="text-yellow-400 font-semibold flex items-center gap-2">
                                                            🔒 Password Protected
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {lobby.hasPassword && (
                                                <>
                                                    {showPasswordFor === lobby.hostUid ? (
                                                        <input
                                                            type="password"
                                                            placeholder="Enter password"
                                                            value={passwordInput[lobby.hostUid] || ''}
                                                            onChange={(e) => 
                                                                setPasswordInput({
                                                                    ...passwordInput,
                                                                    [lobby.hostUid]: e.target.value
                                                                })
                                                            }
                                                            className="flex-1 px-4 py-2 rounded-xl border-2 border-purple-400 bg-slate-700 text-gray-100 font-semibold focus:outline-none focus:border-cyan-400 transition-colors"
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() => togglePasswordInput(lobby.hostUid)}
                                                            className="flex-1 px-6 py-3 rounded-xl border-2 border-yellow-500 bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/50 transition-colors font-semibold"
                                                        >
                                                            Password
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleJoinLobby(lobby)}
                                                disabled={Object.keys(lobby.players).length >= parseInt(lobby.lobbyLimit)}
                                                className={`px-8 py-3 rounded-xl border-2 font-bold transition-all ${
                                                    Object.keys(lobby.players).length >= parseInt(lobby.lobbyLimit)
                                                        ? 'border-gray-500 bg-gray-700/30 text-gray-500 cursor-not-allowed'
                                                        : 'border-cyan-400 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 shadow-lg shadow-cyan-500/20'
                                                }`}
                                            >
                                                Join
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => router.push('/onlineLandingPage')}
                            className="px-8 py-3 rounded-xl border-2 border-gray-500 bg-slate-800/50 text-gray-300 hover:bg-slate-700 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}