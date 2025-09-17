import { PlayerType } from "@/app/classes/player";

export default function CurrentPlayerOverview({ players, turnIndex, updateTurnIndex }: { players: PlayerType[], turnIndex: number, updateTurnIndex: () => void }) {
    return (
        <div>
            <h3>Current Player Overview</h3>
            <p>{players[turnIndex].name}</p>
            {
                players[turnIndex].hand.map((card, index) => {
                    return (
                        <div key={index}>{card.name}</div>
                    )
                })
            }
            <button onClick={updateTurnIndex}>Next Turn</button>

        </div>
    )
}