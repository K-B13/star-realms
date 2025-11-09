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

    const handleScrap = (idx: number, _: string, currentPlayer: string) => {
        append({ t: 'CardScrapped', player: currentPlayer, from: 'row', rowIndex: idx })
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
                            <div key={index} className="pr-1 pl-1">
                                <p>{cardDef.name}</p>
                                <p>Cost {cardDef.cost}</p>
                                <button onClick={() => append([
                                    { t: 'CardPurchased', player: state.order[state.activeIndex], card: card, source: 'row', rowIndex: index },
                                    { t: "TradeSpent", player: state.order[state.activeIndex], card: card, amount: cardDef.cost }
                                    ])}>Buy</button>
                            </div>
                        )
                    })}
                </div>
            </div>
            { state.explorerDeck.length > 0 && <button
            onClick={() => append([
                { t: 'CardPurchased', player: state.order[state.activeIndex], card: 'EXPLORER', source: 'explorer'}, 
                { t: "TradeSpent", player: state.order[state.activeIndex], card: 'EXPLORER', amount: 2 }
                ])}
            >Explorers Deck - {state.explorerDeck.length}</button>}
            {state.order.map((pid: string, idx: number) => {
                const player = state.players[pid];
                console.log(player)
                return (
                    <div key={idx}>
                        <h5>{player.id}</h5> 
                        {state.order[state.activeIndex] !== pid && state.players[state.order[state.activeIndex]].combat > 0 && <button onClick={() => append({ t: 'DamageDealt', from: state.order[state.activeIndex], to: pid, amount: state.players[state.order[state.activeIndex]].combat })}>Attack</button>}
                        <p>A/T/C: {player.authority}/{player.trade}/{player.combat}</p>
                        <p>Hand:</p><hr/>
                        <div className="flex flex-row">
                        {player.hand && player.hand.length > 0 && player.hand.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <div className="pl-1 pr-1" key={index}>
                                    <p>{cardDef.name}</p>
                                    {state.order[state.activeIndex] === pid && <button onClick={() => append({ t: 'CardPlayed', player: state.order[state.activeIndex], handIndex: index })}>Play</button>}
                                </div>
                            
                        })}
                        </div>
                        <p>In Play:</p><hr/>
                        <div className="flex flex-row">
                        {player.inPlay.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <p className="pl-1 pr-1" key={index}>{cardDef.name}</p>
                        })}
                        </div>
                        <p>Discard:</p><hr/>
                        <div className="flex flex-row">
                        {player.discard.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <p className="pl-1 pr-1" key={index}>{cardDef.name}</p>
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