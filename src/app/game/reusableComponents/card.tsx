import { CardDef } from "@/app/engine/cards";
import IconComponent from "./iconComponent";
import { icons } from "../iconIndex";

export default function Card({ 
    card,
    isInTradeRow,
    inPlayerHand = false
 }: { 
    card: CardDef,
    isInTradeRow: boolean,
    inPlayerHand?: boolean
}) {

    return (
        <div className="flex flex-col">
            <div>
                {isInTradeRow && <div className="flex flex-row justify-end"> <p>{card.cost}</p> <IconComponent img={icons.coin} amount={1} /> </div>}
                {!inPlayerHand && <p className="font-semibold mb-2">{card.name}</p>}
                <div className="text-center">
                {
                    card.text.play.map((desc, id) => {
                        return (
                            <p key={id} className="mb-1">
                                {desc}
                            </p>
                        )
                    })
                }
                </div>
            </div>
            {
                card.text.ally && card.text.ally.length > 0 && (
                    <div className="text-center mt-2">
                        <p className="font-semibold">Ally:</p>
                    {
                        card.text.ally.map((desc, id) => {
                            return (
                                <p key={id} className="mb-1">
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
                    <div className="text-center mt-2">
                        <p className="font-semibold">Scrap:</p>
                        {
                            card.text.scrap.map((desc, id) => {
                                return (
                                    <p key={id} className="mb-1">
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