import { initialSetup, shuffle } from "./initialSetup";
import type { GameState } from "./state";
import type { Event, PID } from "./events";
import { BaseDef, CardDef, cardRegistry, Effect } from "./cards";

type Emit = (event: Event) => void;

type Rule<T extends Event['t']> = {
    on: T;
    run: (state: GameState, ev: Extract<Event, {t: T}>, emit: Emit) => void
}

const onPlayRule: Rule<'CardPlayed'> = {
    on: 'CardPlayed',
    run: (state, ev, emit) => {
        const p = state.players[ ev.player ];
        const justPlayed = p.inPlay[p.inPlay.length - 1];
        const def = cardRegistry[ justPlayed ];

        if (def.type === 'ship') {
            emit({
                t: "ShipPlayed",
                player: ev.player,
                card: justPlayed
            })
        }
        if (def.selfScrap) {
            emit({
                t: "PromptShown",
                player: ev.player,
                kind: "scrapSelf",
                optional: true,
                data: {
                    card: justPlayed,
                    inPlayIndex: p.inPlay.length - 1
                }
            })
        }
        for (const ability of def.abilities) {
            if (ability.trigger !== 'onPlay') continue;
            for (const effect of ability.effects) {
                emitEffects(effect, ev.player, emit)
            }
        }
    }
}

const onBasePlayRule: Rule<'BasePlayed'> = {
    on: 'BasePlayed',
    run: (state, ev, emit) => {
        const def = cardRegistry[ ev.card];
        for (const ability of def.abilities) {
            if (ability.trigger !== 'onPlay') continue;
            for (const effect of ability.effects) {
                emitEffects(effect, ev.player, emit)
            }
        }
    }
}

const onAllyRule: Rule<'CardPlayed'> = {
    on: 'CardPlayed',
    run: (state, ev, emit) => {
        const justPlayed = state.players[ ev.player ].inPlay[state.players[ ev.player ].inPlay.length - 1];
        const def = cardRegistry[ justPlayed ];
        const factionCounter = factionCalculator(def, state, ev.player);
        if (factionCounter <= 1) return;
        for (const ability of def.abilities) {
            if (ability.trigger !== 'onAlly') continue;
            for (const effect of ability.effects) {
                emitEffects(effect, ev.player, emit)
            }
        }
    }
}

const onBaseAllyRule: Rule<'BasePlayed'> = {
    on: 'BasePlayed',
    run: (state, ev, emit) => {
        const def = cardRegistry[ ev.card ];
        const factionCounter = factionCalculator(def, state, ev.player);
        if (factionCounter <= 1) return;
        for (const ability of def.abilities) {
            if (ability.trigger !== 'onAlly') continue;
            for (const effect of ability.effects) {
                emitEffects(effect, ev.player, emit)
            }
        }
    }
}

const applyCopyRule: Rule<'TargetCardChosen'> = {
    on: 'TargetCardChosen',
    run: (state, ev, emit) => {
        if (ev.source !== 'copyShip') return;

        const targetId = state.turn.playedThisTurn[ev.inPlayIndex];
        if (!targetId) return;

        if (targetId === 'STEALTHNEEDLE') return;

        const targetDef = cardRegistry[targetId];
        if (!targetDef) return;

        for (const a of targetDef.abilities ?? []) {
            if (a.trigger !== 'onPlay') continue;
            for (const e of a.effects ?? []) {
                emitEffects(e, ev.player, emit)
            }
        }
        emit({ t: "FactionTagAdded", player: ev.player, faction: targetDef.faction, amount: 1 })

        const factionCounter = factionCalculator(targetDef, state, ev.player);

        if (factionCounter >= 1) {
            for (const a of targetDef.abilities ?? []) {
                if (a.trigger !== 'onAlly') continue;
                for (const e of a.effects ?? []) {
                    emitEffects(e, ev.player, emit)
                }
            }
        }
    }
}

const factionCalculator = (def: CardDef, state: GameState, player: PID) => {
    const faction = def.faction;
    const tags = state.players[player].factionTags[faction] ?? 0
    const shipsCounter = state.players[player].inPlay.reduce((acc, card) => {
        const cardDef = cardRegistry[ card ];
        if (cardDef.faction === faction) acc++;
        return acc;
    }, 0);
    const basesCounter = state.players[player].bases.reduce((acc, card) => {
        const cardDef = cardRegistry[ card.id ];
        if (cardDef.faction === faction) acc++;
        return acc;
    }, 0);

    const factionCounter = tags + shipsCounter + basesCounter;
    return factionCounter;
}

const onSelfScrapEffectsRule: Rule<'CardScrapped'> = {
    on: 'CardScrapped',
    run: (state, ev, emit) => {
        const def = cardRegistry[ev.card!];
        if (!def?.abilities) return;
        console.log(ev.card)
        for (const a of def.abilities) {
            if (a.trigger !== 'onScrap') continue;
            for (const e of a.effects) {
                emitEffects(e, ev.player, emit)
            }
        }
    }
}

const cleanupRule: Rule<'PhaseChanged'> = {
    on: 'PhaseChanged',
    run: (state, ev, emit) => {
        if (ev.from !== 'MAIN' || ev.to !== 'CLEANUP') return;
        const activeIdx = state.activeIndex
        const active = state.order[activeIdx]
        emit({ t: 'DiscardInPlayAndHand', player: active })
        emit({ t: 'CardsDrawn', player: active, count: 5 })
        emit({ t: 'TurnAdvanced' })
        emit({ t: 'PhaseChanged', from: 'CLEANUP', to: 'MAIN' })
    }
}

const refillRule: Rule<'CardPurchased'> = {
    on: 'CardPurchased',
    run: (state, ev, emit) => {
        if (ev.source !== 'row') return;
        if (ev.rowIndex === undefined) return;
        const filledInCard = cardRegistry[ ev.card ];
        if (filledInCard.cost > state.players[ev.player].trade && !state.players[ev.player].freeNextAcquire) return;
        emit({ t: 'RowRefilled', rowIndex: ev.rowIndex })
    }
}

const drawManyRule: Rule<'CardsDrawn'> = {
    on: 'CardsDrawn',
    run: (_state, ev, emit) => {
        for (let i = 0; i < ev.count; i++) {
          emit({ t: 'DrawOne', player: ev.player });
        }
    }
}

const ensureDeckRule: Rule<'DrawOne'> = {
    on: 'DrawOne',
    run: (state, ev, emit) => {
        const pl = state.players[ev.player];
        if (pl.deck.length > 0) return;           
        if (pl.discard.length === 0) return;      
        const newDeck = shuffle(pl.discard.slice());
        emit({ t: 'DeckShuffle', player: ev.player, newDeck });
        emit({ t: 'DrawOne', player: ev.player });
    }
}

const onScrapTradeRowRules: Rule<'CardScrapped'> = {
    on: "CardScrapped",
    run: (state, ev, emit) => {
        if (ev.from === 'row') {
            emit({ t: 'RowRefilled', rowIndex: ev.placementIndex })   
        }
    }
}

const opponentSelectedRules: Rule<'TargetChosen'> = {
    on: 'TargetChosen',
    run: (state, ev, emit) => {
        switch (ev.purpose) {
            case 'opponentDiscard':
                emit({
                    t: 'PromptShown',
                    player: ev.player,
                    kind: 'opponentDiscard',
                    optional: false,
                    data: { target: ev.target }
                })
                break;
            case 'destroyOpponentBase':
                emit({
                    t: 'PromptShown',
                    player: ev.player,
                    kind: 'chooseOpponentBase',
                    optional: true,
                    data: { target: ev.target }
                })
                break;
            default:
                break;
        }
    }
}

const onBaseUpkeepRule: Rule<'BaseActivated'> = {
    on: 'BaseActivated',
    run: (state, ev, emit) => {
        const p = state.players[ev.player];
        const base = p.bases[ev.baseIndex];
        if (!base) return;
        const def = cardRegistry[base.id];
        for (const ability of def.abilities ?? []) {
            if (ability.trigger !== 'onPlay') continue
            for (const effect of ability.effects ?? []) {
                emitEffects(effect, ev.player, emit)
            }
        }
    }
}

const baseUpkeepResetRule: Rule<'TurnAdvanced'> = {
    on: 'TurnAdvanced',
    run: (state, _ev, emit) => {
        const nextPlayerIndex = (state.activeIndex + 1) % state.order.length;
        
        const upcomingActivePlayer = state.order[nextPlayerIndex];
        const upcomingPlayerState = state.players[upcomingActivePlayer];
        upcomingPlayerState.bases.forEach(base => {
            base.activatedThisTurn = false;
        })
    }
}

const twoOrMoreBasesInPlayRule: Rule<'TwoOrMoreBasesInPlay'> = {
    on: 'TwoOrMoreBasesInPlay',
    run: (state, _ev, emit) => {
        if (state.players[state.order[state.activeIndex]].bases.length >= 2) {
            emit({ t: 'CardsDrawn', player: state.order[state.activeIndex], count: 2 })
        }
    }
}

const drawPerFactionCardRule: Rule<'DrawPerFactionCard'> = {
    on: 'DrawPerFactionCard',
    run: (state, ev, emit) => {
        const factionCounter = factionCalculator(cardRegistry[ev.card], state, state.order[state.activeIndex]);
        if (factionCounter >= 1) {
            emit({ t: 'CardsDrawn', player: state.order[state.activeIndex], count: factionCounter })
        }
    }
}

const discardOrScrapAndDrawChosenRule: Rule<'DiscardOrScrapAndDrawChosen'> = {
    on: 'DiscardOrScrapAndDrawChosen',
    run: (state, ev, emit) => {
        emit({ t: 'PromptShown', player: ev.player, kind: 'discardOrScrapAndDraw', optional: true, data: { maxCards: ev.maxCards, action: ev.action } });
    }
}

const discardOrScrapAndDrawRule: Rule<'CardsDiscardedOrScrappedForDraw'> = {
    on: 'CardsDiscardedOrScrappedForDraw',
    run: (state, ev, emit) => {
        const sortedIndices = [...ev.discardedIndices].sort((a, b) => b - a);
        for (const idx of sortedIndices) {
            if (ev.action === 'scrap') {
                emit({ t: 'CardScrapped', player: ev.player, from: 'hand', placementIndex: idx, card: state.players[ev.player].hand[idx] });
            } else {
                emit({ t: 'CardDiscarded', player: ev.player, card: state.players[ev.player].hand[idx], rowIndex: idx });
            }
        }

        if (ev.discardedIndices.length > 0) {
            emit({ t: 'CardsDrawn', player: ev.player, count: ev.discardedIndices.length });
        }
    }
}

const fleetHQRule: Rule<'ShipPlayed'> = {
    on: 'ShipPlayed',
    run: (state, ev, emit) => {
        const hasFleetHQ = state.players[ev.player].bases.some(base => base.id === 'FLEETHQ')

        if (hasFleetHQ) {
            emit({ t: 'CombatAdded', player: ev.player, amount: 1 });
        }
    }
}

const rules: Rule<Event['t']>[] = [ onPlayRule, onBasePlayRule, onAllyRule, onBaseAllyRule, applyCopyRule, onSelfScrapEffectsRule, cleanupRule, refillRule, drawManyRule, ensureDeckRule, onScrapTradeRowRules, opponentSelectedRules, onBaseUpkeepRule, baseUpkeepResetRule, twoOrMoreBasesInPlayRule, drawPerFactionCardRule, discardOrScrapAndDrawChosenRule, discardOrScrapAndDrawRule, fleetHQRule ] as Rule<Event['t']>[]

const emitEffects = (e: Effect, player: PID, emit: Emit) => {
    switch (e.kind) {
        case 'addTrade':       emit({ t:'TradeAdded',     player, amount: e.amount }); break;
        case 'addCombat':      emit({ t:'CombatAdded',    player, amount: e.amount }); break;
        case 'addAuthority':   emit({ t:'AuthorityAdded', player, amount: e.amount }); break;
        case 'drawCards':      emit({ t:'CardsDrawn',     player, count:  e.amount }); break;
        case 'nextAcquireTop': emit({ t:'NextAcquireToTopSet',  player }); break;
        case 'nextAcquireFree': emit({ t:'NextAcquireFreeSet',   player }); break;
        case 'multiBaseCondition': emit({ t: 'TwoOrMoreBasesInPlay', player, amount: e.amount }); break;
        case 'scrapAndDraw': emit({ t: 'DiscardOrScrapAndDrawChosen', player, maxCards: e.maxCards, action: 'scrap' }); break;
        case 'addAllFactionTags': {
            emit({ t: "FactionTagAdded", player, faction: 'Trade Federation', amount: 1 })
            emit({ t: "FactionTagAdded", player, faction: 'Blob Faction', amount: 1 })
            emit({ t: "FactionTagAdded", player, faction: 'Star Empire', amount: 1 })
            break;
        }
        case 'prompt':         emit({ t:'PromptShown', player, kind: e.prompt.kind, optional: !!e.prompt.optional, data: e.prompt.data }); break;
      }
}

function runRules(state: GameState, ev: Event): Event[] {
    const emitted: Event[] = [];
    const emit: Emit = (e) => emitted.push(e);
    for (const r of rules) {
      if (r.on === ev.t) r.run(state, ev, emit);
    }
    return emitted;
  }

export const applyEvent = (state: GameState, event: Event) => {
    switch (event.t) {
        case 'CardPlayed':
            const p = state.players[event.player];
            const card = p.hand[event.handIndex];
            const cardPlayedDef = cardRegistry[card]
            if (!cardPlayedDef || cardPlayedDef.type !== 'ship') return state;
            removeOne(p.hand, event.handIndex);
            p.inPlay.push(card);
            state.turn.playedThisTurn.push(card);
            return state;
        case 'TradeAdded':
            state.players[ event.player ].trade += event.amount;
            return state;
        case 'CombatAdded':
            state.players[ event.player ].combat += event.amount;
            return state;
        case 'AuthorityAdded':
            state.players[ event.player ].authority += event.amount;
            return state;
        case 'TradeSpent':
            const currentPlayer = state.players[event.player]
            if (currentPlayer.freeNextAcquire) {
                currentPlayer.freeNextAcquire = false;
                return state
            }
            if (cardRegistry[event.card].cost > currentPlayer.trade) return state
            currentPlayer.trade = Math.max(0, currentPlayer.trade - event.amount);
            return state;
        case 'CardPurchased':
            const filledInCard = cardRegistry[ event.card ];
            if (filledInCard.cost > state.players[event.player].trade && !state.players[event.player].freeNextAcquire) { console.log('Not enough money'); return state };
            const activePlayerCardPurchased = state.players[event.player];
            if (event.source === 'row') {
                if (event.rowIndex === null || event.rowIndex === undefined || event.rowIndex < 0 || event.rowIndex > state.row.length) return state
                const cardAtSlot = state.row[event.rowIndex];
                if (!cardAtSlot) return state;
                
                if (activePlayerCardPurchased.acquireLocation === 'top') {
                    activePlayerCardPurchased.deck.unshift(cardAtSlot)
                    activePlayerCardPurchased.acquireLocation = 'discard'
                }
                else {
                    activePlayerCardPurchased.discard.push(cardAtSlot)
                }
                return state
            }
            if (event.source === 'explorer') {
                if (!state.explorerDeck.length) return state;
                const cardId = state.explorerDeck.pop()!
                activePlayerCardPurchased.discard.push(cardId)
                return state;
            }
            return state;
        case 'RowRefilled':
            if (state.tradeDeck.length === 0) {
                const beforeCard = state.row.slice(0, event.rowIndex)
                const afterCard = state.row.slice(event.rowIndex + 1)
                state.row = [...beforeCard, ...afterCard]
                return state;
            }
            const newCard = state.tradeDeck.pop();
            if (!newCard) return state;
            state.row[event.rowIndex] = newCard;
            return state;
        case 'CardScrapped':
            if (event.from === 'row') {
                const cardAtSlot = state.row[event.placementIndex];
                state.scrap.push(cardAtSlot) 
            } else if (event.from === 'hand') {
                const p = state.players[event.player]
                const i = event.placementIndex;
                if (i < 0 || i >= p.hand.length) return state;
                const [ removed ] = p.hand.splice(i, 1)
                state.scrap.push(removed)
                return state 
            } else if (event.from === 'inPlay') {
                const p = state.players[event.player]
                const i = event.placementIndex;
                if (i < 0 || i >= p.inPlay.length) return state;
                const [ removed ] = p.inPlay.splice(i, 1)
                state.scrap.push(removed) 
                return state 
            } else if (event.from === 'discard') {
                const p = state.players[event.player]
                const i = event.placementIndex;
                if (i < 0 || i >= p.discard.length) return state;
                const [ removed ] = p.discard.splice(i, 1)
                state.scrap.push(removed)
                return state 
            } else if (event.from === 'bases') {
                const p = state.players[event.player]
                const i = event.placementIndex
                if (i < 0 || i >= p.bases.length) return state;
                const [ removed ] = p.bases.splice(i, 1)
                state.scrap.push(removed.id)
                return state
            }
            return state;
        case 'CardDiscarded':
            const discardedPlayer = state.players[event.player];
            const i = event.rowIndex;
            if (i === null || i < 0 || i >= discardedPlayer.hand.length) return state;
            const [ removed ] = discardedPlayer.hand.splice(i, 1)
            discardedPlayer.discard.push(removed)
            return state;
        case 'CardsDrawn':
            return state;
        case 'DrawOne':
            const pla = state.players[event.player];
            if (pla.deck.length === 0) return state
            pla.hand.push(pla.deck.shift()!)
            return state;
        case 'DeckShuffle':
            const play = state.players[event.player];
            play.deck = event.newDeck.slice()
            play.discard = []
            return state
        case 'DiscardInPlayAndHand':
            const activePlayer = state.players[ event.player ]
            activePlayer.discard = [ ...activePlayer.discard, ...activePlayer.inPlay, ...activePlayer.hand ]
            activePlayer.inPlay = [];
            activePlayer.hand = [];
            activePlayer.combat = 0;
            activePlayer.trade = 0;
            activePlayer.acquireLocation = 'discard';
            activePlayer.freeNextAcquire = false;
            state.players[event.player] = activePlayer;
            activePlayer.factionTags = {};
            state.turn.playedThisTurn = [];
            return state;
        case 'DamageDealt':
            const attacker = state.players[ event.from ];
            const target = state.players[ event.to ];
            const amount = Math.max(0, event.amount)
            if (attacker.combat < amount){
                return state;
            }
            target.authority = Math.max(0, target.authority - amount);
            attacker.combat -= amount;
            return state;
        case 'NextAcquireToTopSet':
            const player = state.players[event.player];
            player.acquireLocation = 'top';
            return state;
        case 'NextAcquireFreeSet':
            state.players[event.player].freeNextAcquire = true;
            return state;
        case 'FactionTagAdded': {
            const player = state.players[event.player];
            player.factionTags ??= {};
            if (event.faction === 'Machine Cult') return state;
            player.factionTags[event.faction] = (player.factionTags[event.faction] ?? 0) + event.amount;
            return state;
        }
        case 'BasePlayed':
            const basePlayedPlayer = state.players[event.player];
            const def = cardRegistry[event.card];
            removeOne(basePlayedPlayer.hand, event.handIndex);
            if (def.type === 'ship') return state;
            basePlayedPlayer.bases.push({
                id: event.card,
                shield: def.shield,
                defence: def.defence,
                damage: 0,
                activatedThisTurn: true,
            });
            
            return state;
        case 'BaseActivated':
            const playerWithBase = state.players[event.player];
            playerWithBase.bases[event.baseIndex].activatedThisTurn = true;
            return state;
        case 'BaseDamaged':
            const playerWithBaseToBeDamaged = state.players[event.player];
            const baseDef = cardRegistry[playerWithBaseToBeDamaged.bases[event.baseIndex].id] as BaseDef
            const currentShieldHealth = baseDef.defence - playerWithBaseToBeDamaged.bases[event.baseIndex].damage
            if (currentShieldHealth > event.amount) {
                playerWithBaseToBeDamaged.bases[event.baseIndex].damage += event.amount;
                state.players[state.order[state.activeIndex]].combat -= event.amount;
                return state;
            }
            state.players[state.order[state.activeIndex]].combat -= currentShieldHealth;
            const [ baseRemoved ] = playerWithBaseToBeDamaged.bases.splice(event.baseIndex, 1);
            state.players[event.player].discard.push(baseRemoved.id);
            return state;
        case 'BaseChosenToDestroy':
            const targetPlayerState = state.players[event.targetPlayer];
            if (event.baseIndex < 0 || event.baseIndex >= targetPlayerState.bases.length) return state;
            const [ destroyedBase ] = targetPlayerState.bases.splice(event.baseIndex, 1);
            targetPlayerState.discard.push(destroyedBase.id);
            return state;
        case 'TwoOrMoreBasesInPlay':
            return state;
        case 'DrawPerFactionCard':
            return state;
        case 'DiscardOrScrapAndDrawChosen':
            return state;
        case 'CardsDiscardedOrScrappedForDraw':
            return state;
        case 'ShipPlayed':
            return state;
        case 'TurnAdvanced':
            state.activeIndex = (state.activeIndex + 1) % state.order.length;
            return state;
        case 'PhaseChanged':
            state.turn.phase = event.to;
            return state;
        case 'PromptShown':
            return state;
        case 'PromptCancelled':
            return state;
        default:
            return state;
    }
}

export const deepClone = <T>(x: T): T => {
    return JSON.parse(JSON.stringify(x));
}

export const recompute = (events: Event[], playerNames: string[]): GameState => {
    let state = initialSetup(playerNames);
    const queue = [...events]
    while (queue.length) {
        const ev = queue.shift()!;
        if (ev.t === 'DrawOne') {
          const followUps = runRules(state, ev);
          for (let i = followUps.length - 1; i >= 0; i--) {
            queue.unshift(followUps[i]);
          }
        }
        state = applyEvent(state, ev);
        const followUps = runRules(state, ev);
        for (let i = followUps.length - 1; i >= 0; i--) {
            queue.unshift(followUps[i]);
        }
    }
    return state;
}

export const materialize = (base: GameState, events: Event[]) => {
    let state = deepClone(base)
    const queue = [...events], expanded: Event[] = [];
    while (queue.length) {
        const ev = queue.shift()!; expanded.push(ev);
        if (ev.t === 'DrawOne') {
            const followUps = runRules(state, ev);
            for (let i = followUps.length - 1; i >= 0; i--) {
                queue.unshift(followUps[i]);
            }
            state = applyEvent(state, ev);
        } else {
            state = applyEvent(state, ev);
            const followUps = runRules(state, ev);
            for (let i = followUps.length - 1; i >= 0; i--) {
              queue.unshift(followUps[i]);
            }
        }
    }
    return { state, events: expanded};
}

export const replay = (base: GameState, events: Event[]) => {
    let state = deepClone(base);
    for (const ev of events) {
        state = applyEvent(state, ev)
    }
    return state;
}

const removeOne = (arr: string[], index: number): boolean => {
    arr.splice(index, 1);
    return true;
}