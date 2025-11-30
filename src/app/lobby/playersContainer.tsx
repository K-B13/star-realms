'use client'
import { useState } from "react"
import Players from "./players"
import Link from "next/link"

export interface Player {
    name: string,
    host: boolean,
    color: string,
}

export default function PlayersContainer() {
    const firstPlayer = {
        name: 'Player 1',
        host: true,
        color: 'blue'
    }

    const [ players, setPlayers ] = useState<Player[]>([
        firstPlayer
    ])

    const createNewPlayer = () => {
        const newPlayer = {
            name: `Player ${players.length + 1}`,
            host: false,
            color: 'blue'
        }
        setPlayers([ ...players, newPlayer ])
    }

    const handlePlayerChange = (idx: number, playerData: Player) => {
        const oldPlayers = [ ...players ]
        oldPlayers[idx] = playerData
        setPlayers([...oldPlayers])
    }

    const colorOptions = [
        'blue',
        'red',
        'green',
        'purple',
        'yellow',
        'black'
    ]

    return (
        <div>
            {
                players.map((player, idx) => {
                    return <Players key={idx} playerData={player} colourOptions={colorOptions} position={idx} handlePlayerChange={handlePlayerChange}/>
                })
            }
            
            {
                players.length < 6 &&
                <button onClick={createNewPlayer}>Add New Player</button>
            }
            <br />
            {
                players.length > 1 &&
                <Link href={`/game?players=${encodeURIComponent(JSON.stringify(players))}`}>Click</Link>
            }
        </div>
    )
}