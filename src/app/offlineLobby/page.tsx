'use client'
import LobbySettings from "./lobbySettings";
import PlayersContainer from "./playersContainer";
import { useState } from "react";

export interface Player {
    id: string,
    name: string,
    host: boolean,
    color?: string,
}

export interface GameData {
    lobbyName: string
    packs: string[],
    type: 'PVP' | 'Co-Op',
    password: string
}

export default function Lobby() {
    const [ gameData, setGameData ] = useState<GameData>({
        lobbyName: 'Your Lobby',
        packs: [
            'baseDeck'
        ],
        type: 'PVP',
        password: ''
    })
    const firstPlayer = {
            id: crypto.randomUUID(),
            name: 'Player 1',
            host: true,
            color: 'Blue'
        }
    
    const [ players, setPlayers ] = useState<Player[]>([
        firstPlayer
    ])

    const createNewPlayer = () => {
        const newPlayer = {
            id: crypto.randomUUID(),
            name: `Player ${players.length + 1}`,
            host: false,
            color: getAvailableColors(players.length)[0]
        }
        setPlayers([ ...players, newPlayer ])
    }

    const handlePlayerChange = (idx: number, playerData: Player) => {
        const oldPlayers = [ ...players ]
        oldPlayers[idx] = playerData
        setPlayers([...oldPlayers])
    }

    const removePlayer = (idx: number) => {
        const oldPlayers = [ ...players ]
        oldPlayers.splice(idx, 1)
        setPlayers([...oldPlayers])
    }

    const colorOptions = [
        'Blue',
        'Red',
        'Green',
        'Purple',
        'Yellow',
        'Black',
        'Indigo',
        'Orange',
        'Pink'
    ]

    const getAvailableColors = (currentPlayerIndex: number) => {
        const usedColors = players
            .filter((_, idx) => idx !== currentPlayerIndex)
            .map(p => p.color)
        return colorOptions.filter(color => !usedColors.includes(color))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto border-4 border-cyan-400 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-2xl shadow-cyan-500/20">
                <h1 className="text-3xl font-bold text-center mb-5 text-cyan-300 drop-shadow-lg">{gameData.lobbyName}</h1>
                <div className="flex gap-5">
                    <LobbySettings gameData={gameData} players={players}/>
                    <PlayersContainer 
                        players={players} 
                        createNewPlayer={createNewPlayer} 
                        handlePlayerChange={handlePlayerChange}
                        removePlayer={removePlayer}
                        getAvailableColors={getAvailableColors}
                    />
                </div>
            </div>
        </div>
    )
}