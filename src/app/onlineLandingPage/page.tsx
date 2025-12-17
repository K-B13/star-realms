'use client'
import OnlineNameCreation from "./onlineNameCreation";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type RevealButtonType = 'Host' | 'Join' | '';

export default function OnlineLandingPage() {
    const router = useRouter()
    const [revealButton, setRevealButton] = useState<RevealButtonType>('');
    const [name, setName] = useState('');

    const changeRevealButton = (buttonName: RevealButtonType) => {
        setRevealButton(buttonName);
    }
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }
    const clearNameChange = () => {
        setName('')
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
            <div className="w-full max-w-6xl">
                <h1 className="text-5xl font-bold text-center mb-12 text-cyan-300 drop-shadow-lg">Star Realms Online</h1>
                <div className="flex flex-col sm:flex-row gap-8">
                    <OnlineNameCreation nextPage='/lobbyCreation' revealButton={revealButton} buttonName='Host' changeRevealButton={changeRevealButton} handleNameChange={handleNameChange} name={name} clearNameChange={clearNameChange}/>
                    <OnlineNameCreation nextPage='/lobbySelection' revealButton={revealButton} buttonName='Join' changeRevealButton={changeRevealButton} handleNameChange={handleNameChange} name={name} clearNameChange={clearNameChange}/>
                </div>
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => router.push('/')}
                        className="px-8 py-3 rounded-xl border-2 border-gray-500 bg-slate-800/50 text-gray-300 hover:bg-slate-700 transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}