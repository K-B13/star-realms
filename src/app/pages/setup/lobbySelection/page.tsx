'use client'
import { useEffect, useState } from "react"
import Lobby from "./lobby"

export interface LobbyType {
    lobbyName: string,
    hostName: string,
    type: "Co-Op" | 'PvP',
    playerLimit: number,
    currentPlayers: number,
    password?: string,
    id: string,
}

const mockLobbyOne: LobbyType = {
    lobbyName: 'Mock One',
    hostName: 'Mock Player',
    type: 'PvP',
    playerLimit: 6,
    currentPlayers: 3,
    password: 'Yes',
    id: '1ad'
}
const mockLobbyTwo: LobbyType = {
    lobbyName: 'Mock Two',
    hostName: 'Mock Player',
    type: 'PvP',
    playerLimit: 4,
    currentPlayers: 1,
    id: '2eq'
}

export default function LobbySelection() {
    const [lobbies, setLobbies] = useState<LobbyType[]>([])
    // const errorMessage
    useEffect(() => {
        setLobbies([
            mockLobbyOne,
            mockLobbyTwo
        ])
    }, [])
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <h2 className="text-2xl">Lobby Selection</h2>
            <div>
                {
                    lobbies.map((lobby, index) => {
                        return (
                            <Lobby lobby={lobby} key={index}/>
                        )
                    })
                }
            </div>
        </div>
    )
}