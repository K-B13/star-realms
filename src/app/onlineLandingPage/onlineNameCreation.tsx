'use client'
import { RevealButtonType } from "./page";
import { auth } from "../firebase/firebaseConfig";
import { signInAnonymously } from "firebase/auth";
import { playerPath } from "../firebase/firebasePaths";
import { writeValue } from "../firebase/firebaseActions";
import { useRouter } from "next/navigation";

export interface OnlinePlayer {
    name: string,
    ready: boolean,
    uid: string,
    host: boolean,
}

export default function OnlineNameCreation({ 
    nextPage,
    revealButton,
    buttonName,
    changeRevealButton,
    handleNameChange,
    name,
    clearNameChange
}: { 
    nextPage: string, 
    revealButton: RevealButtonType,
    buttonName: RevealButtonType,
    changeRevealButton: (buttonName: RevealButtonType) => void,
    handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    name: string,
    clearNameChange: () => void
}) {
    const isHost = buttonName === 'Host';
    const borderColor = isHost ? 'border-cyan-400' : 'border-purple-400';
    const shadowColor = isHost ? 'shadow-cyan-500/20 hover:shadow-cyan-500/30' : 'shadow-purple-500/20 hover:shadow-purple-500/30';
    const textColor = isHost ? 'text-cyan-300' : 'text-purple-300';
    const icon = isHost ? '🎯' : '🚀';

    const router = useRouter();

    const createPlayers = async () => {
        const userCredentials = await signInAnonymously(auth)
        const uid = userCredentials.user.uid;
        if (!userCredentials) return;
        const newPlayer: OnlinePlayer = {
            name: name,
            ready: false,
            uid: uid,
            host: false,

        }
        await writeValue(playerPath(uid), newPlayer)
    }

    const handleCreateAndGo = async () => {
        if (!name) return;

        await createPlayers();
        router.push(nextPage);
    }

    return (
        <div className={`flex-1 border-4 ${borderColor} rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl ${shadowColor} transition-all duration-300`}>
            {
            revealButton === buttonName ? 
                <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-5xl mb-6">{icon}</div>
                    <h2 className={`text-3xl font-bold ${textColor} mb-6`}>{buttonName} Game</h2>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Enter your name" 
                            onChange={handleNameChange} 
                            value={name}
                            className="w-full px-4 py-3 rounded-xl bg-slate-700 border-2 border-slate-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                        />
                        <div className="flex gap-3 h-12">
                            {name !== '' && (
                                <>
                                    <button 
                                        onClick={clearNameChange}
                                        className="flex-1 px-6 py-3 rounded-xl border-2 border-red-500 bg-red-900/40 hover:bg-red-800/60 text-red-200 font-semibold transition-all"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleCreateAndGo}
                                        className="flex-1 px-6 py-3 rounded-xl border-2 border-green-500 bg-green-900/40 hover:bg-green-800/60 text-green-200 font-semibold transition-all text-center flex items-center justify-center"
                                    >
                                        Go
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div> :
                <div className="text-center cursor-pointer group" onClick={() => { changeRevealButton(buttonName) }}>
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{icon}</div>
                    <h2 className={`text-4xl font-bold ${textColor} mb-4`}>{buttonName}</h2>
                    <p className="text-gray-300 text-lg">
                        {isHost ? 'Create a new game lobby' : 'Join an existing game'}
                    </p>
                    <div className={`mt-6 px-8 py-3 rounded-xl border-2 ${borderColor.replace('border-', 'border-')} bg-slate-700/50 hover:bg-slate-600/50 ${textColor} font-semibold transition-all inline-block`}>
                        Click to {buttonName}
                    </div>
                </div>
            }
        </div>
    )
}