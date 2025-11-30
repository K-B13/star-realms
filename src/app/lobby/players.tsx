import { useState } from "react"
import { Player } from "./playersContainer"

export default function Players({playerData, colourOptions, position, handlePlayerChange}: { playerData: Player, colourOptions: string[], position: number, handlePlayerChange: (idx: number, playerData: Player) => void }) {
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
    return (
        <div>
            <input value={player} onChange={handleChangeInput}/>
            <select onChange={handleChangeSelect}>
                {
                    colourOptions.map((colour, index) => {
                        return <option key={index} value={colour}>{colour}</option>
                    })
                }
            </select>
            { stateDifference() && 
                <button onClick={() => {
                    const newPlayerData = {
                        ...playerData,
                        name: player,
                        color: colourState
                    }
                    handlePlayerChange(position, newPlayerData)
                    }}>
                    Change
                </button> 
            }
        </div>
    )
}