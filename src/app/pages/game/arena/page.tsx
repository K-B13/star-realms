'use client'
import { useEffect, useState } from "react";
import OtherPlayersOverview from "./otherPlayersOverview";
import TradeRow from "./tradeRow";
import { playerFactoryFunction, PlayerType, shuffleDeck } from "@/app/classes/player";
import CurrentPlayerOverview from "./currentPlayerOverview";
import { loadTradeRow } from "@/app/loadTradeRow";
import { CardType } from "@/app/classes/card";
import CardArea from "./cardArea";

export default function ArenaPage() {
    const [ players, setPlayers ] = useState<PlayerType[]>([])
    const [ turnIndex, setTurnIndex ] = useState(0)
    const [ tradeRow, setTradeRow ] = useState<CardType[]>([])
    const [ tradeDeck, setTradeDeck ] = useState<CardType[]>([])
    // const [ currentPlayer, setCurrentPlayer ] = useState<PlayerType>(players[0])
    
    useEffect(() => {
        const mockPlayer = playerFactoryFunction('Player 1', true, '1')
        const mockPlayerTwo = playerFactoryFunction('Player 2', false, '2')
        const tradeRowCards = loadTradeRow()
        shuffleDeck(tradeRowCards)
        setTradeDeck(tradeRowCards)
        setPlayers([mockPlayer, mockPlayerTwo])
    }, [])

    const revealNextTradeRowCard = () => {
        if (tradeRow.length >= 5 || tradeDeck.length === 0) return
        const nextCard = tradeDeck.pop()
        if (!nextCard) return
        setTradeRow([...tradeRow, nextCard])
        setTradeDeck([...tradeDeck])
    }

    const selectTradeRowCard = (card: CardType) => {
        const newTradeRow = tradeRow.filter(tradeCard => tradeCard.id !== card.id)
        setTradeRow([...newTradeRow])
    }

    const updateTurnIndex = () => {
        setTurnIndex((turnIndex + 1) % players.length)
    }
    return (
        <div>
            <h1>Arena</h1>
            <button onClick={() => console.log(tradeRow)}>Show Trade Row</button>
            <CardArea tradeDeck={tradeDeck} tradeRow={tradeRow} selectTradeRowCard={selectTradeRowCard}/>
            <OtherPlayersOverview players={players} />
            <CurrentPlayerOverview players={players} turnIndex={turnIndex} updateTurnIndex={updateTurnIndex}/>
            <button onClick={revealNextTradeRowCard}>Add card to row</button>
        </div>
    )
}