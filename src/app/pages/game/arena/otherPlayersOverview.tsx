import { PlayerType } from "@/app/classes/player";

export default function OtherPlayersOverview({ players }: { players: PlayerType[]}) {
    return (
        <div>
            {
                players.map((player, index) => {
                    if (player.name === players[0].name) return
                    return (
                        <div key={index}>
                            <h1>{player.name}</h1>
                            <div>
                                {player.bases.map(base => {
                                    return (
                                        <div key={base.id}>
                                            <p>{base.name}</p>
                                            <img src={base.outpost ? '/outpost.png' : '/base.png'} alt={base.name}/>
                                            <p>x {base.shield}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <p></p>
                            {/* <p>{player.factions['Neutral']}</p> */}
                        </div>
                    )
                })
            }
        </div>
    )
}