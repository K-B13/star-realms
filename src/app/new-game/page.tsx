'use client'
import dynamic from 'next/dynamic';

const NewGamePage = dynamic(() => import('../game/new-game-page'), {
    ssr: false,
    loading: () => (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <p className="text-cyan-300 text-2xl">Loading game...</p>
        </div>
    )
});

export default function NewGame() {
    return <NewGamePage />
}
