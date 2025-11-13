'use client'
import { useMemo, useState } from "react";
import { replay, materialize } from "../engine/recompute";
import { cardRegistry } from "../engine/cards";
import { Event } from "../engine/events";
import { useEffect } from "react";
import { initialSetup } from "../engine/initialSetup";
import { getActivePrompt } from "../helperFunctions/activePromptFunction";
import ScrapPromptOverlay from "../promptOverlays/tradeRowOverlay";
import OpponentDiscardOverlay from "../promptOverlays/opponentDiscardOverlay";
import OpponentChoiceOverlay from "../promptOverlays/opponentChoiceOverlay";
import ChooseToScrapOverlay from "../promptOverlays/chooseToScrapOverlay";
import ChooseOtherCardToScrapOverlay from "../promptOverlays/chooseOtherCardToScrapOverlay";
import Card from "./reusableComponents/card";
import ChooseAbilityOverlay from "../promptOverlays/chooseAbilityOverlay";
import ChooseCardToCopyOverlay from "../promptOverlays/chooseCardToCopyOverlay";

export const factionColor = {
    "Trade Federation": "bg-blue-500",
    "Blob Faction": "bg-green-500",
    "Machine Cult": "bg-red-500",
    "Star Empire": "bg-yellow-500",
    "Neutral": "bg-gray-500",
}

export default function Game() {
    const players = useMemo(() => ['A', 'B'], [])
    const [ mounted, setMounted ] = useState(false);
    const [ turnEvents, setTurnEvents ] = useState<Event[]>([])
    const [ snapshot, setSnapshot ] = useState(() => initialSetup(players))
    const state = replay(snapshot, turnEvents)
    const { prompt: activePrompt } = getActivePrompt(turnEvents)

    useEffect(() => {
        setMounted(true)
    }, [])

    const append = (root: Event | Event[]) => {
      setTurnEvents(prev => {
        const base = replay(snapshot, prev);

        const roots = Array.isArray(root) ? root : [root];
        const { events: expandedNew } = materialize(base, roots);

        return [...prev, ...expandedNew];
      });
    };

    if (!mounted) {
        return <div>Loading...</div>
    };

    const handleScrap = (idx: number, card: string, currentPlayer: string) => {
        append({ t: 'CardScrapped', player: currentPlayer, from: 'row', placementIndex: idx, card })
    }

    const handleFreeCard = (idx: number, card: string, currentPlayer: string) => {
        append([
            { t: 'NextAcquireFreeSet', player: currentPlayer },
            { t: 'NextAcquireToTopSet', player: currentPlayer },
            { t: 'CardPurchased', player: currentPlayer, card: card, source: 'row', rowIndex: idx },
            { t: "TradeSpent", player: state.order[state.activeIndex], card: card, amount: cardRegistry[card].cost }
        ])
    }

    return (
        <div>
            <h1>Star Realms</h1>
            <h4>Active: {state.order[state.activeIndex]} - Phase: {state.turn.phase}</h4>
            <div className="flex flex-col">
                <p>Trade Row: {state.tradeDeck.length}</p>
                <div className="flex flex-row">
                    { state.row.map((card, index) => {
                        const cardDef = cardRegistry[card];
                        return (
                            <div key={index} className={`${factionColor[cardDef.faction]} pr-1 pl-1 border-solid border-2`}>
                                <Card card={cardDef} isInTradeRow={true}/>
                                <button onClick={() => append([
                                    { t: 'CardPurchased', player: state.order[state.activeIndex], card: card, source: 'row', rowIndex: index },
                                    { t: "TradeSpent", player: state.order[state.activeIndex], card: card, amount: cardDef.cost }
                                    ])}>Buy</button>
                            </div>
                        )
                    })}
                </div>
            </div>
            { state.explorerDeck.length > 0 && 
            <div className={`flex flex-col items-center ${factionColor['Neutral']}`}>
                <Card card={cardRegistry['EXPLORER']} isInTradeRow={false}/>
                <button
                onClick={() => append([
                    { t: 'CardPurchased', player: state.order[state.activeIndex], card: 'EXPLORER', source: 'explorer'}, 
                    { t: "TradeSpent", player: state.order[state.activeIndex], card: 'EXPLORER', amount: 2 }
                    ])}>
                    Get an Explorer - {state.explorerDeck.length} Left
                </button>
            </div>}
            {state.order.map((pid: string, idx: number) => {
                const player = state.players[pid];
                console.log(player)
                return (
                    <div key={idx}>
                        <h5>{player.id}</h5> 
                        {state.order[state.activeIndex] !== pid && state.players[state.order[state.activeIndex]].combat > 0 && <button onClick={() => append({ t: 'DamageDealt', from: state.order[state.activeIndex], to: pid, amount: state.players[state.order[state.activeIndex]].combat })}>Attack</button>}
                        <p>A/T/C: {player.authority}/{player.trade}/{player.combat}</p>
                        <p>Hand:</p><hr/>
                        <div className="flex flex-row justify-center">
                        {player.hand && player.hand.length > 0 && player.hand.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <div className={`${factionColor[cardDef.faction]} ml-1 mr-1 pl-1 pr-1 border-solid border-2`} key={index}>
                                    <Card card={cardDef} isInTradeRow={false}/>
                                    <div className="flex flex-row">
                                        {
                                            cardDef.selfScrap &&
                                            <button onClick={() => append({ t: 'CardScrapped', player: pid, from: 'hand', placementIndex: index, card: card })}>Scrap</button>
                                        }
                                        {state.order[state.activeIndex] === pid && <button onClick={() => append({ t: 'CardPlayed', player: state.order[state.activeIndex], handIndex: index })}>Play</button>}
                                    </div>
                                </div>
                            
                        })}
                        </div>
                        <p>In Play:</p><hr/>
                        <div className="flex flex-row">
                        {player.inPlay.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <div className={`${factionColor[cardDef.faction]} pl-1 pr-1 border-solid border-2`} key={index}>
                                <Card card={cardDef} isInTradeRow={false}/>
                                {
                                    cardDef.selfScrap &&
                                    <button onClick={() => append({ t: 'CardScrapped', player: pid, from: 'inPlay', placementIndex: index, card: card })}>Scrap</button>
                                }
                            </div>
                        })}
                        </div>
                        <p>Discard:</p><hr/>
                        <div className="flex flex-row">
                        {player.discard.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <div className={`${factionColor[cardDef.faction]} pl-1 pr-1 border-solid border-2`} key={index}>
                                <Card card={cardDef} isInTradeRow={false}/>
                            </div>
                        })}
                        </div>
                    </div>
                )
            })}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapRow' && (state.row.length > 0) && (
                <ScrapPromptOverlay 
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    handleFunction={handleScrap}
                />
            )}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseRowForFree' && (state.row.length > 0) && (
                <ScrapPromptOverlay 
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    handleFunction={handleFreeCard}
                />
            )}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'opponentDiscard' && (
              <OpponentDiscardOverlay
                state={state}
                activePrompt={activePrompt}
                append={append}
                currentPlayer={state.order[state.activeIndex]}
              />
            )}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'choosePlayer' && (
              <OpponentChoiceOverlay
                state={state}
                activePrompt={activePrompt}
                append={append}
                currentPlayer={state.order[state.activeIndex]}
              />
            )}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapSelf' && (
              <ChooseToScrapOverlay
                state={state}
                activePrompt={activePrompt}
                append={append}
                currentPlayer={state.order[state.activeIndex]}
              />
            )}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseOtherCardToScrap' && (
              <ChooseOtherCardToScrapOverlay
                state={state}
                activePrompt={activePrompt}
                append={append}
                currentPlayer={state.order[state.activeIndex]}
              />
            )}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseAbility' && (
              <ChooseAbilityOverlay
                state={state}
                activePrompt={activePrompt}
                append={append}
                currentPlayer={state.order[state.activeIndex]}
              />
            )}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseInPlayShip' && (
              <ChooseCardToCopyOverlay
                state={state}
                activePrompt={activePrompt}
                append={append}
                currentPlayer={state.order[state.activeIndex]}
              />
            )}
            <button onClick={() => {
                const base = replay(snapshot, turnEvents);
                const { state: endState } =
                materialize(base, [{ t: 'PhaseChanged', from: 'MAIN', to: 'CLEANUP' }]);

                setSnapshot(endState)
                setTurnEvents([])
            }}>Next Turn</button>
            <br />
            <button onClick={() => console.log(state)}>State</button>
        </div>
    )
}