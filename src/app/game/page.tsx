'use client'
import { useMemo, useState } from "react";
import { replay, materialize } from "../engine/recompute";
import { cardRegistry } from "../engine/cards";
import { Event, Phase } from "../engine/events";
import { useEffect } from "react";
import { initialSetup } from "../engine/initialSetup";

export default function Game() {
    const players = useMemo(() => ['A', 'B'], [])
    const [ mounted, setMounted ] = useState(false);
    const [ turnEvents, setTurnEvents ] = useState<Event[]>([])
    const [ snapshot, setSnapshot ] = useState(() => initialSetup(players))
    const state = replay(snapshot, turnEvents)

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

    return (
        <div>
            <h1>Star Realms</h1>
            <h4>Active: {state.order[state.activeIndex]} - Phase: {state.turn.phase}</h4>

            { state.explorerDeck.length > 0 && <button
            onClick={() => append([
                { t: 'CardPurchased', player: state.order[state.activeIndex], card: 'EXPLORER', source: 'explorer', to: 'discard' }, 
                { t: "TradeSpent", player: state.order[state.activeIndex], card: 'EXPLORER', amount: 2 }
                ])}
            >Explorers Deck</button>}
            {state.order.map((pid: string, idx: number) => {
                const player = state.players[pid];
                console.log(player)
                return (
                    <div key={idx}>
                        <h5>{player.id}</h5> 
                        {state.order[state.activeIndex] !== pid && state.players[state.order[state.activeIndex]].combat > 0 && <button onClick={() => append({ t: 'DamageDealt', from: state.order[state.activeIndex], to: pid, amount: state.players[state.order[state.activeIndex]].combat })}>Attack</button>}
                        <p>A/T/C: {player.authority}/{player.trade}/{player.combat}</p>
                        <p>Hand:</p><hr/>
                        {player.hand && player.hand.length > 0 && player.hand.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <div key={index}>
                                    <p>{cardDef.name}</p>
                                    {state.order[state.activeIndex] === pid && <button onClick={() => append({ t: 'CardPlayed', player: state.order[state.activeIndex], handIndex: index })}>Play</button>}
                                </div>
                            
                        })}
                        <p>In Play:</p><hr/>
                        {player.inPlay.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <p key={index}>{cardDef.name}</p>
                        })}
                        <p>Discard:</p><hr/>
                        {player.discard.map((card, index) => {
                            const cardDef = cardRegistry[card];
                            return <p key={index}>{cardDef.name}</p>
                        })}
                    </div>
                )
            })}
            <button onClick={() => {
                const base = replay(snapshot, turnEvents);
                const { state: endState } =
                materialize(base, [{ t: 'PhaseChanged', from: 'MAIN', to: 'CLEANUP' }]);

                setSnapshot(endState)
                setTurnEvents([])
            }}>Next Turn</button>
            
            
            <button onClick={() => append({ t: 'TradeAdded', player: state.order[state.activeIndex], amount: 1 })}>Add 1 Trade</button>
            <button onClick={() => console.log(state)}>State</button>
            <br />
            <button onClick={() => console.log(state.order[state.activeIndex], state.players[state.order[state.activeIndex]]?.combat)}>Prompt</button>
        </div>
    )
}