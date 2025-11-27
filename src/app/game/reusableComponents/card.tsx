import { CardDef } from "@/app/engine/cards";
import IconComponent from "./iconComponent";
import { icons } from "../iconIndex";

export default function Card({ 
    card,
    isInTradeRow 
 }: { 
    card: CardDef,
    isInTradeRow: boolean
}) {

    return (
        <div className="flex flex-col ">
            <div>
                {isInTradeRow && <div className="flex flex-row justify-end"> <p>{card.cost}</p> <IconComponent img={icons.coin} amount={1} /> </div>}
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