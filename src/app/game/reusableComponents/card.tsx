import { CardDef } from "@/app/engine/cards";

export default function Card({ 
    card,
    isInTradeRow 
 }: { 
    card: CardDef,
    isInTradeRow: boolean
}) {
    // Some cards need to know the cost when rendered like in trade row.
    return (
        <div className="flex flex-col">
            <div>
                {isInTradeRow && <p>{card.cost}</p>}
                <p>{card.name}</p>
                {
                    card.text.play.map((desc, id) => {
                        return (
                            <p key={id}>
                                {desc}
                            </p>
                        )
                    })
                }
            </div>
            {
                card.text.ally && card.text.ally.length > 0 && (
                    <div>
                        <p>Ally: </p>
                    {
                        card.text.ally.map((desc, id) => {
                            return (
                                <p key={id}>
                                    {desc}
                                </p>
                            )      
                        })
                    }
                    </div>
                )
            }
            {
                card.text.scrap && card.text.scrap.length > 0 && (
                    <div>
                        <p>Scrap: </p>
                        {
                            card.text.scrap.map((desc, id) => {
                                return (
                                    <p key={id}>
                                        {desc}
                                    </p>
                                )
                            })
                        }
                    </div>
                )
            }

        </div>
    )
}