'use client'
import { useState, useEffect } from "react"
import { auth } from "../firebase/firebaseConfig"
import { getValue, writeValue } from "../firebase/firebaseActions"
import { lobbyPath, playerPath } from "../firebase/firebasePaths"
import { useRouter } from "next/navigation";
import { OnlinePlayer } from "../onlineLandingPage/onlineNameCreation";

export interface LobbyInterface {
    hostName: string,
    hostUid: string,
    lobbyName: string,
    gameMode: string,
    hasCustomPlayerLimit: boolean,
    lobbyLimit: string,
    hasPassword: boolean,
    lobbyPassword: string,
    expansionPacks: string[]
    players: { [uid: string]: OnlinePlayer },
    gameStarted: boolean
}

export default function LobbyCreation() {
    const router = useRouter()
    const [ showPassword, setShowPassword ] = useState(false)
    const [ lobbyInformation, setLobbyInformation ] = useState<LobbyInterface>({
        hostName: '',
        hostUid: '',
        lobbyName: 'Name Lobby',
        gameMode: 'PvP',
        hasCustomPlayerLimit: false,
        lobbyLimit:'2',
        hasPassword: false,
        lobbyPassword: '',
        expansionPacks: [],
        players: {},
        gameStarted: false
    })

    const fetchHostName = async () => {
        const hostUid = auth.currentUser?.uid
        if (!hostUid) return;
        const snapshot = await getValue(playerPath(hostUid))
        const host = snapshot.val()
        host.host = true
        if (!snapshot) return;
        setLobbyInformation({
            ...lobbyInformation,
            hostName: host.name,
            hostUid: host.uid,
            lobbyName: `${host.name}'s Lobby`,
            players: { [host.uid]: host },
        })
    }

    useEffect(() => {
        fetchHostName()
    }, [])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setLobbyInformation({
            ...lobbyInformation,
            [name]: value
        })
    }

    const adjustLobbyLimit = (direction: 'up' | 'down') => {
        const currentLimit = Number(lobbyInformation.lobbyLimit)
        if (direction === 'up' && currentLimit < 6) {
            setLobbyInformation({
                ...lobbyInformation,
                lobbyLimit: String(currentLimit + 1)
            })
        } else if (direction === 'down' && currentLimit > 2) {
            setLobbyInformation({
                ...lobbyInformation,
                lobbyLimit: String(currentLimit - 1)
            })
        }
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>, additionalInformation: string | boolean) => {
        const { name } = event.currentTarget
        setLobbyInformation({
            ...lobbyInformation,
            [name]: additionalInformation
        })
    }

    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const createLobby = async () => {
        const uid = auth.currentUser?.uid
        if (!uid) return;
        await writeValue(lobbyPath(uid), lobbyInformation)
    }

    const handleCreateAndGo = async () => {
        const uid = auth.currentUser?.uid
        if (!uid) return;
        await createLobby();
        router.push('/lobby/' + uid);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                <div className="border-4 border-cyan-400 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl shadow-cyan-500/20">
                    <h1 className="text-4xl font-bold text-cyan-300 mb-8 text-center">Lobby Creation</h1>
                    
                    <div className="space-y-6">
                        <div>
                            <input 
                                type="text" 
                                value={lobbyInformation.hostName}
                                disabled
                                className="w-full px-6 py-3 rounded-xl border-2 border-purple-400 bg-slate-700/50 text-gray-100 text-lg font-semibold text-center cursor-not-allowed"
                                placeholder="Username"
                            />
                        </div>

                        <div>
                            <input 
                                type="text" 
                                name="lobbyName" 
                                value={lobbyInformation.lobbyName} 
                                onChange={handleChange}
                                className="w-full px-6 py-3 rounded-xl border-2 border-purple-400 bg-slate-700 text-gray-100 text-lg font-semibold text-center focus:outline-none focus:border-cyan-400 transition-colors"
                                placeholder="Lobby Name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                name='gameMode' 
                                onClick={(event) => handleClick(event, 'Co-Op')}
                                className={`px-6 py-3 rounded-xl border-2 text-lg font-semibold transition-all ${
                                    lobbyInformation.gameMode === 'Co-Op' 
                                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/30' 
                                        : 'border-purple-400 bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                Co-Op
                            </button>
                            <button 
                                name='gameMode' 
                                onClick={(event) => handleClick(event, 'PvP')}
                                className={`px-6 py-3 rounded-xl border-2 text-lg font-semibold transition-all ${
                                    lobbyInformation.gameMode === 'PvP' 
                                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/30' 
                                        : 'border-purple-400 bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                PvP
                            </button>
                        </div>

                        <div>
                            <p className="text-gray-300 text-center text-lg font-semibold mb-3">Lobby Limit</p>
                            <div className="flex items-center justify-center gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="hasCustomPlayerLimit" 
                                            checked={lobbyInformation.hasCustomPlayerLimit}
                                            onChange={(event) => handleClick(event, !lobbyInformation.hasCustomPlayerLimit)}
                                            className="peer w-6 h-6 rounded border-2 border-purple-400 bg-slate-700 appearance-none cursor-pointer checked:bg-cyan-500 checked:border-cyan-400 transition-all"
                                        />
                                        <svg 
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-300 group-hover:text-cyan-300 transition-colors">Custom</span>
                                </label>
                                {lobbyInformation.hasCustomPlayerLimit && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => adjustLobbyLimit('down')}
                                            disabled={Number(lobbyInformation.lobbyLimit) <= 2}
                                            className="w-10 h-10 rounded-lg border-2 border-purple-400 bg-slate-700 text-cyan-300 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-700 transition-all font-bold text-xl flex items-center justify-center"
                                        >
                                            ◀
                                        </button>
                                        <div className="w-16 px-4 py-2 rounded-lg border-2 border-purple-400 bg-slate-700 text-gray-100 text-center font-bold text-lg">
                                            {lobbyInformation.lobbyLimit}
                                        </div>
                                        <button
                                            onClick={() => adjustLobbyLimit('up')}
                                            disabled={Number(lobbyInformation.lobbyLimit) >= 6}
                                            className="w-10 h-10 rounded-lg border-2 border-purple-400 bg-slate-700 text-cyan-300 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-700 transition-all font-bold text-xl flex items-center justify-center"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-300 text-center text-lg font-semibold mb-3">Lobby Password</p>
                            <div className="flex items-center justify-center gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="hasPassword" 
                                            checked={lobbyInformation.hasPassword}
                                            onChange={(event) => handleClick(event, !lobbyInformation.hasPassword)}
                                            className="peer w-6 h-6 rounded border-2 border-purple-400 bg-slate-700 appearance-none cursor-pointer checked:bg-cyan-500 checked:border-cyan-400 transition-all"
                                        />
                                        <svg 
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-300 group-hover:text-cyan-300 transition-colors">Enable</span>
                                </label>
                                {lobbyInformation.hasPassword && (
                                    <>
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            name="lobbyPassword"
                                            value={lobbyInformation.lobbyPassword}
                                            onChange={handleChange}
                                            className="flex-1 max-w-xs px-4 py-2 rounded-lg border-2 border-purple-400 bg-slate-700 text-gray-100 font-semibold focus:outline-none focus:border-cyan-400 transition-colors"
                                            placeholder="Enter password"
                                        />
                                        <button 
                                            onClick={handleShowPassword}
                                            className="px-4 py-2 rounded-lg border-2 border-purple-400 bg-slate-700 text-gray-300 hover:bg-slate-600 transition-colors font-semibold"
                                        >
                                            {showPassword ? '🙈' : '👁️'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-gray-300 text-lg font-semibold mb-3">Expansion Packs</p>
                            <button className="px-6 py-3 rounded-xl border-2 border-purple-400 bg-slate-700 text-gray-300 hover:bg-slate-600 transition-colors font-semibold">
                                Select Expansions
                            </button>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleCreateAndGo}
                                className="w-full px-8 py-4 rounded-xl border-3 border-cyan-400 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xl font-bold hover:from-cyan-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => router.push('/onlineLandingPage')}
                        className="px-8 py-3 rounded-xl border-2 border-gray-500 bg-slate-800/50 text-gray-300 hover:bg-slate-700 transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}