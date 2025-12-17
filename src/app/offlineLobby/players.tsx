import { useState } from "react"
import { Player } from "./page"

export default function Players({
    playerData, 
    colourOptions, 
    position, 
    handlePlayerChange,
    removePlayer,
    showRemove
}: { 
    playerData: Player, 
    colourOptions: string[], 
    position: number, 
    handlePlayerChange: (idx: number, playerData: Player) => void,
    removePlayer: (idx: number) => void,
    showRemove: boolean
}) {
    const [ player, setPlayer ] = useState(playerData.name)
    const [ colourState, setColorState ] = useState(playerData.color)
    
    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value
        setPlayer(newName)
    }
    
    const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newColour = e.target.value
        setColorState(newColour)
    }
    
    const stateDifference = () => {
        return playerData.name !== player || playerData.color !== colourState
    }

    const handleSave = () => {
        const newPlayerData = {
            ...playerData,
            name: player,
            color: colourState
        }
        handlePlayerChange(position, newPlayerData)
    }

    const colorMap: Record<string, string> = {
        'Blue': 'bg-blue-500',
        'Red': 'bg-red-500',
        'Green': 'bg-green-500',
        'Purple': 'bg-purple-500',
        'Yellow': 'bg-yellow-500',
        'Black': 'bg-gray-900',
        'Indigo': 'bg-indigo-500',
        'Orange': 'bg-orange-500',
        'Pink': 'bg-pink-500'
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex-1 border-4 border-blue-500 rounded-2xl px-6 py-3 flex items-center justify-between bg-slate-600/50 shadow-md shadow-blue-500/20">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <input 
                        value={player} 
                        onChange={handleChangeInput}
                        onBlur={stateDifference() ? handleSave : undefined}
                        className="text-xl font-semibold bg-transparent border-none outline-none flex-1 min-w-0 text-gray-100 placeholder-gray-400"
                        placeholder="Player Name"
                    />
                    {playerData.host && <span className="text-lg font-bold text-yellow-400 whitespace-nowrap ml-4">- Host</span>}
                </div>
                <div className="flex items-center gap-3 ml-4">
                    <div className={`w-10 h-10 rounded-lg border-2 border-gray-400 ${colourState ? colorMap[colourState] : 'bg-gray-500'}`}></div>
                    <select 
                        value={colourState || ''}
                        onChange={handleChangeSelect}
                        onBlur={stateDifference() ? handleSave : undefined}
                        className="text-lg font-semibold border-2 border-blue-400 rounded-lg px-3 py-1.5 bg-slate-700 text-gray-100"
                    >
                        {colourOptions.map((colour, index) => {
                            return <option key={index} value={colour}>{colour}</option>
                        })}
                    </select>
                </div>
            </div>
            {showRemove ? (
                <button 
                    onClick={() => removePlayer(position)}
                    className="border-4 border-red-500 rounded-xl w-12 h-12 flex items-center justify-center text-3xl font-bold text-red-400 hover:bg-red-900/50 transition-colors shadow-md shadow-red-500/20 flex-shrink-0"
                    aria-label="Remove player"
                >
                    ✕
                </button>
            ) : (
                <div className="w-12 h-12 flex-shrink-0"></div>
            )}
        </div>
    )
}