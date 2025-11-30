'use client'

// This is a visual mockup to verify the layout matches the design
// Not connected to game logic yet

export default function GameMockup() {
    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-2.5 h-full">
                
                {/* TOP SECTION: Trade Row & Explorers */}
                <div className="flex gap-2.5 items-center">
                    {/* Deck Counter */}
                    <div className="border-3 border-cyan-400 rounded-xl bg-slate-800 p-3 w-28 text-center shadow-lg shadow-cyan-500/20">
                        <p className="text-sm font-bold text-cyan-300">Deck</p>
                        <p className="text-xl font-bold text-gray-100">75/80</p>
                    </div>

                    {/* Trade Row - 5 cards */}
                    <div className="flex-1 flex gap-2.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex-1 border-3 border-purple-500 rounded-xl bg-slate-700 p-3 flex flex-col items-center justify-center shadow-lg shadow-purple-500/20 min-h-[110px]">
                                <div className="text-gray-400 text-sm mb-1">Slot</div>
                                <button className="border-2 border-cyan-400 rounded-lg px-4 py-1.5 text-sm text-cyan-300 font-semibold hover:bg-cyan-900/30 transition-colors">
                                    Select
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Explorers */}
                    <div className="border-3 border-cyan-400 rounded-xl bg-slate-800 p-3 w-28 text-center shadow-lg shadow-cyan-500/20">
                        <p className="text-sm font-bold text-cyan-300">Explorers</p>
                        <p className="text-xl font-bold text-gray-100">10/10</p>
                    </div>
                </div>

                {/* PLAYER SUMMARY BAR */}
                <div className="flex gap-2.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex-1 border-3 border-blue-500 rounded-xl bg-slate-700 p-2.5 shadow-lg shadow-blue-500/20">
                            <p className="text-sm font-bold text-yellow-400 mb-1">Player {i}</p>
                            <p className="text-xs text-gray-200">Authority: 50</p>
                            <p className="text-xs text-gray-200">Silver: 2</p>
                            <p className="text-xs text-gray-200">Black: 1</p>
                        </div>
                    ))}
                </div>

                {/* OPPONENT BASES VIEWER */}
                <div className="border-3 border-purple-500 rounded-xl bg-slate-800 p-3 shadow-lg shadow-purple-500/20">
                    <div className="flex items-center gap-3">
                        {/* Left Navigation */}
                        <button className="border-3 border-cyan-400 rounded-lg w-14 h-14 flex items-center justify-center text-cyan-300 text-2xl hover:bg-cyan-900/30 transition-colors shadow-md shadow-cyan-400/20">
                            ◄
                        </button>

                        {/* Bases Display */}
                        <div className="flex-1">
                            <p className="text-base font-bold text-purple-300 mb-2 text-center">Player 2 Bases</p>
                            <div className="flex gap-3 justify-center">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="border-2 border-blue-400 rounded-lg bg-slate-600 p-2.5 w-36 shadow-md shadow-blue-400/20">
                                        <p className="text-center text-sm font-bold text-gray-100 mb-1">Base</p>
                                        <p className="text-center text-xs text-gray-200">Shield: 6 {i === 1 ? '⚫' : '⚪'}</p>
                                        <div className="mt-1.5 bg-red-500 h-1.5 rounded-full"></div>
                                        <div className="mt-1 bg-gray-700 h-2.5 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Navigation */}
                        <button className="border-3 border-cyan-400 rounded-lg w-14 h-14 flex items-center justify-center text-cyan-300 text-2xl hover:bg-cyan-900/30 transition-colors shadow-md shadow-cyan-400/20">
                            ►
                        </button>
                    </div>
                </div>

                {/* CURRENT PLAYER BASES */}
                <div className="border-3 border-cyan-500 rounded-xl bg-slate-800 p-3 shadow-lg shadow-cyan-500/20">
                    <p className="text-base font-bold text-cyan-300 mb-2 text-center">Player 1 Bases (You)</p>
                    <div className="flex gap-3 justify-center">
                        <div className="border-2 border-blue-400 rounded-lg bg-slate-600 p-2.5 w-36 shadow-md shadow-blue-400/20">
                            <p className="text-center text-sm font-bold text-gray-100 mb-1">Base</p>
                            <p className="text-center text-xs text-gray-200">Shield: 6 ⚫</p>
                            <div className="mt-1.5 bg-red-500 h-1.5 rounded-full"></div>
                            <div className="mt-1 bg-gray-700 h-2.5 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* CURRENT PLAYER HAND */}
                <div className="flex gap-2.5 flex-1 min-h-0">
                    {/* Left Side: Discard & Deck */}
                    <div className="flex flex-col gap-2.5">
                        <div className="border-3 border-emerald-500 rounded-xl bg-slate-800 p-2.5 w-24 text-center shadow-lg shadow-emerald-500/20 flex-1 flex items-center justify-center">
                            <p className="text-sm font-bold text-emerald-300">Discard</p>
                        </div>
                        <div className="border-3 border-emerald-500 rounded-xl bg-slate-800 p-2.5 w-24 text-center shadow-lg shadow-emerald-500/20 flex-1 flex items-center justify-center">
                            <p className="text-sm font-bold text-emerald-300">Deck</p>
                        </div>
                    </div>

                    {/* Center: Hand Cards */}
                    <div className="flex-1 flex gap-2.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex-1 border-3 border-blue-500 rounded-xl bg-slate-700 p-3 flex flex-col items-center justify-between shadow-lg shadow-blue-500/20">
                                <div className="text-gray-400 text-sm mb-1">Card {i}</div>
                                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                                    [Card]
                                </div>
                                <button className="border-2 border-yellow-400 rounded-lg px-4 py-1.5 text-sm text-yellow-300 font-semibold hover:bg-yellow-900/30 transition-colors w-full mt-2">
                                    Play
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Right Side: Player Info */}
                    <div className="border-3 border-purple-500 rounded-xl bg-slate-800 p-3 w-36 shadow-lg shadow-purple-500/20 flex flex-col justify-between">
                        <div>
                            <p className="text-base font-bold text-yellow-400 mb-2 text-center">Player 1</p>
                            <p className="text-sm text-gray-200 mb-1">Authority: 50</p>
                            <p className="text-sm text-gray-200 mb-1">Trade: 5</p>
                            <p className="text-sm text-gray-200 mb-1">Combat: 3</p>
                        </div>
                        <button className="border-2 border-red-500 rounded-lg px-3 py-2 text-red-300 font-semibold hover:bg-red-900/30 transition-colors w-full text-sm">
                            End Turn
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
