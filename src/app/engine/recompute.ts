import { initialSetup, shuffle } from "./initialSetup";
import type { CombatNotification, GameState } from "./state";
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
        
        // Only discard and draw if player is alive
        if (!state.players[active].isDead) {
            emit({ t: 'DiscardInPlayAndHand', player: active })
            emit({ t: 'CardsDrawn', player: active, count: 5 })
        }
        
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
            emit({ t: 'CardsDrawn', player: state.order[state.activeIndex], count: factionCounter - 1})
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

const playerDeathRule: Rule<'DamageDealt'> = {
    on: 'DamageDealt',
    run: (state, ev, emit) => {
        const target = state.players[ev.to];
        if (target.authority <= 0 && !target.isDead) {
            emit({ t: 'PlayerDied', player: ev.to });
        }
    }
}

const gameOverRule: Rule<'PlayerDied'> = {
    on: 'PlayerDied',
    run: (state, _ev, emit) => {
        const alivePlayers = state.order.filter(pid => !state.players[pid].isDead);
        if (alivePlayers.length === 1) {
            emit({ t: 'GameOver', winner: alivePlayers[0] });
        }
    }
}

const rules: Rule<Event['t']>[] = [ onPlayRule, onBasePlayRule, onAllyRule, onBaseAllyRule, applyCopyRule, onSelfScrapEffectsRule, cleanupRule, refillRule, drawManyRule, ensureDeckRule, onScrapTradeRowRules, opponentSelectedRules, onBaseUpkeepRule, baseUpkeepResetRule, twoOrMoreBasesInPlayRule, drawPerFactionCardRule, discardOrScrapAndDrawChosenRule, discardOrScrapAndDrawRule, fleetHQRule, playerDeathRule, gameOverRule ] as Rule<Event['t']>[]

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
        case 'prompt': emit({ t:'PromptShown', player, kind: e.prompt.kind, optional: !!e.prompt.optional, data: e.prompt.data }); break;
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

            state.log.push({
                type: 'game_event',
                content: `${event.player} played ${card}`,
                timestamp: Date.now(),
            })
            return state;
        case 'TradeAdded':
            state.players[ event.player ].trade += event.amount;

            state.log.push({
                type: 'game_event',
                content: `${event.player} added ${event.amount} trade`,
                timestamp: Date.now(),
            })
            return state;
        case 'CombatAdded':
            state.players[ event.player ].combat += event.amount;

            state.log.push({
                type: 'game_event',
                content: `${event.player} added ${event.amount} combat`,
                timestamp: Date.now(),
            })
            return state;
        case 'AuthorityAdded':
            state.players[ event.player ].authority += event.amount;
            state.log.push({
                type: 'game_event',
                content: `${event.player} added ${event.amount} authority`,
                timestamp: Date.now(),
            })
            return state;
        case 'TradeSpent':
            const currentPlayer = state.players[event.player]
            if (currentPlayer.freeNextAcquire) {
                currentPlayer.freeNextAcquire = false;
                state.log.push({
                    type: 'game_event',
                    content: `${event.player} used free next acquire`,
                    timestamp: Date.now(),
                })
                return state
            }
            if (cardRegistry[event.card].cost > currentPlayer.trade) return state
            currentPlayer.trade = Math.max(0, currentPlayer.trade - event.amount);
            state.log.push({
                type: 'game_event',
                content: `${event.player} spent ${event.amount} trade`,
                timestamp: Date.now(),
            })
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
                    state.log.push({
                        type: 'game_event',
                        content: `${event.player} purchased ${event.card} from row added to top of deck`,
                        timestamp: Date.now(),
                    })
                }
                else {
                    activePlayerCardPurchased.discard.push(cardAtSlot)
                    state.log.push({
                        type: 'game_event',
                        content: `${event.player} purchased ${event.card} from row added to discard`,
                        timestamp: Date.now(),
                    })
                }
                return state
            }
            if (event.source === 'explorer') {
                if (!state.explorerDeck.length) return state;
                const cardId = state.explorerDeck.pop()!
                activePlayerCardPurchased.discard.push(cardId)
                state.log.push({
                    type: 'game_event',
                    content: `${event.player} purchased ${event.card} from explorer added to discard leaving ${state.explorerDeck.length} cards in explorer deck`,
                    timestamp: Date.now(),
                })
                return state;
            }
            return state;
        case 'RowRefilled':
            const oldCard = state.row[event.rowIndex];
            if (state.tradeDeck.length === 0) {
                const beforeCard = state.row.slice(0, event.rowIndex)
                const afterCard = state.row.slice(event.rowIndex + 1)
                state.row = [...beforeCard, ...afterCard]
                return state;
            }
            const newCard = state.tradeDeck.pop();
            if (!newCard) return state;
            state.row[event.rowIndex] = newCard;
            state.log.push({
                type: 'game_event',
                content: `${oldCard} replaced by ${newCard} in the trade row`,
                timestamp: Date.now(),
            })
            return state;
        case 'CardScrapped':
            if (event.from === 'row') {
                const cardAtSlot = state.row[event.placementIndex];
                state.scrap.push(cardAtSlot) 
                state.log.push({
                    type: 'game_event',
                    content: `${cardAtSlot} scrapped from trade row`,
                    timestamp: Date.now(),
                })
            } else if (event.from === 'hand') {
                const p = state.players[event.player]
                const i = event.placementIndex;
                if (i < 0 || i >= p.hand.length) return state;
                const [ removed ] = p.hand.splice(i, 1)
                state.scrap.push(removed)
                state.log.push({
                    type: 'game_event',
                    content: `${event.player} scrapped ${removed} from hand`,
                    timestamp: Date.now(),
                })
                return state 
            } else if (event.from === 'inPlay') {
                const p = state.players[event.player]
                const i = event.placementIndex;
                if (i < 0 || i >= p.inPlay.length) return state;
                const [ removed ] = p.inPlay.splice(i, 1)
                state.scrap.push(removed) 
                state.log.push({
                    type: 'game_event',
                    content: `${event.player} scrapped ${removed} from discard`,
                    timestamp: Date.now(),
                })
                return state 
            } else if (event.from === 'discard') {
                const p = state.players[event.player]
                const i = event.placementIndex;
                if (i < 0 || i >= p.discard.length) return state;
                const [ removed ] = p.discard.splice(i, 1)
                state.scrap.push(removed)
                state.log.push({
                    type: 'game_event',
                    content: `${event.player} scrapped ${removed} from discard`,
                    timestamp: Date.now(),
                })
                return state 
            } else if (event.from === 'bases') {
                const p = state.players[event.player]
                const i = event.placementIndex
                if (i < 0 || i >= p.bases.length) return state;
                const [ removed ] = p.bases.splice(i, 1)
                state.scrap.push(removed.id)
                state.log.push({
                    type: 'game_event',
                    content: `${event.player} scrapped ${removed.id} from bases`,
                    timestamp: Date.now(),
                })
                return state
            }
            return state;
        case 'CardDiscarded':
            const discardedPlayer = state.players[event.player];
            const i = event.rowIndex;
            if (i === null || i < 0 || i >= discardedPlayer.hand.length) return state;
            const [ removed ] = discardedPlayer.hand.splice(i, 1)
            discardedPlayer.discard.push(removed)
            state.log.push({
                type: 'game_event',
                content: `${event.player} discarded ${removed}`,
                timestamp: Date.now(),
            })
            return state;
        case 'CardsDrawn':
            if (state.turn.phase === 'MAIN') {
                state.log.push({
                    type: 'game_event',
                    content: `${event.player} draws ${event.count} card(s)`,
                    timestamp: Date.now()
                })
            }
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
            const actualDamage = Math.min(amount, target.authority);
            target.authority = Math.max(0, target.authority - amount);
            attacker.combat -= actualDamage;
            state.log.push({
                type: 'game_event',
                content: `${attacker.id} dealt ${actualDamage} damage to ${target.id}`,
                timestamp: Date.now(),
            })
            state = handleCombatLogs(state, target.id, attacker.id, actualDamage, 'player')
            return state;
        case 'NextAcquireToTopSet':
            const player = state.players[event.player];
            player.acquireLocation = 'top';
            state.log.push({
                type: 'game_event',
                content: `${event.player} set next acquire to top of deck`,
                timestamp: Date.now(),
            })
            return state;
        case 'NextAcquireFreeSet':
            state.players[event.player].freeNextAcquire = true;
            state.log.push({
                type: 'game_event',
                content: `${event.player} set next acquire to free`,
                timestamp: Date.now(),
            })
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
            state.log.push({
                type: 'game_event',
                content: `${event.player} played ${event.card}`,
                timestamp: Date.now(),
            })
            return state;
        case 'BaseActivated':
            const playerWithBase = state.players[event.player];
            const selectedBase = playerWithBase.bases[event.baseIndex];
            if (!selectedBase) {
                return state;
            }
            selectedBase.activatedThisTurn = true;
            state.log.push({
                type: 'game_event',
                content: `${event.player} activated ${selectedBase.id}`,
                timestamp: Date.now(),
            })
            return state;
        case 'BaseDamaged':
            const playerWithBaseToBeDamaged = state.players[event.player];
            const selectedBaseToBeDamaged = playerWithBaseToBeDamaged.bases[event.baseIndex];
            if (!selectedBaseToBeDamaged) {
                return state;
            }
            
            const baseDef = cardRegistry[selectedBaseToBeDamaged.id] as BaseDef

            const currentShieldHealth = baseDef.defence - selectedBaseToBeDamaged.damage

            if (currentShieldHealth > event.amount) {
                selectedBaseToBeDamaged.damage += event.amount;
                state.players[state.order[state.activeIndex]].combat -= event.amount;
                state = handleCombatLogs(state, event.player, state.order[state.activeIndex], event.amount, 'base', selectedBaseToBeDamaged.id, false)
                state.log.push({
                    type: 'game_event',
                    content: `${event.player} dealt ${event.amount} damage to ${selectedBaseToBeDamaged.id} belonging to ${event.player}`,
                    timestamp: Date.now(),
                })
                return state;
            }

            state.players[state.order[state.activeIndex]].combat -= currentShieldHealth;
            const [ baseRemoved ] = playerWithBaseToBeDamaged.bases.splice(event.baseIndex, 1);
            state.players[event.player].discard.push(baseRemoved.id);
            state = handleCombatLogs(state, event.player, state.order[state.activeIndex], event.amount, 'base', baseRemoved.id, true)
            state.log.push({
                type: 'game_event',
                content: `${event.player} destroyed ${baseRemoved.id} with ${baseRemoved.defence - baseRemoved.damage} damage belonging to ${event.player}`,
                timestamp: Date.now(),
            })
            return state;
        case 'BaseChosenToDestroy':
            const targetPlayerState = state.players[event.targetPlayer];
            if (event.baseIndex < 0 || event.baseIndex >= targetPlayerState.bases.length) return state;
            const [ destroyedBase ] = targetPlayerState.bases.splice(event.baseIndex, 1);
            targetPlayerState.discard.push(destroyedBase.id);
            state.log.push({
                type: 'game_event',
                content: `${event.targetPlayer} chose to destroy ${destroyedBase.id} belonging to ${event.targetPlayer}`,
                timestamp: Date.now(),
            })
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
        case 'Chat':
            if (event.to) {
                state.log.push({
                    type: event.type,
                    content: event.content,
                    timestamp: Date.now(),
                    from: event.from,
                    to: event.to
                })
            } else {
                state.log.push({
                    type: event.type,
                    content: event.content,
                    timestamp: Date.now(),
                    from: event.from,
                })
            }
            return state;
        case 'TurnAdvanced':
            // Clear notifications for the player whose turn is ending
            const endingPlayerId = state.order[state.activeIndex];
            state.currentTurnNotifications[endingPlayerId] = [];
            state.log.push({
                type: 'game_event',
                content: `${endingPlayerId} has ended their turn`,
                timestamp: Date.now(),
            })
            // Skip dead players
            let nextIndex = (state.activeIndex + 1) % state.order.length;
            let attempts = 0;
            // Keep advancing until we find an alive player or we've checked everyone
            while (state.players[state.order[nextIndex]].isDead && attempts < state.order.length) {
                nextIndex = (nextIndex + 1) % state.order.length;
                attempts++;
            }
            state.activeIndex = nextIndex;
            state.log.push({
                type: 'game_event',
                content: `${state.order[state.activeIndex]} is now active`,
                timestamp: Date.now(),
            })
            return state;
        case 'PhaseChanged':
            state.turn.phase = event.to;
            return state;
        case 'PromptShown':
            return state;
        case 'PromptCancelled':
            return state;
        case 'PlayerDied':
            state.players[event.player].isDead = true;
            state.eliminationCount++;
            state.players[event.player].eliminationOrder = state.eliminationCount;
            state.log.push({
                type: 'game_event',
                content: `${event.player} has died`,
                timestamp: Date.now(),
            })
            return state;
        case 'GameOver':
            state.gameOver = true;
            state.winner = event.winner;
            state.log.push({
                type: 'game_event',
                content: `${event.winner} has won the game`,
                timestamp: Date.now(),
            })
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

const handleCombatLogs = (state: GameState, targetPlayer: string, attacker: string, amount: number, targetType: 'player' | 'base', baseName?: string, baseDestroyed?: boolean) => {
    const notification: CombatNotification = {
        id: `combat-${state.combatLog.length + 1}`,
        targetPlayer,
        attacker,
        amount,
        targetType,
        ...(targetType === 'base' && { baseName, baseDestroyed })  // Only add base fields if it's a base attack
    }
    // Add to global combat log
    state.combatLog.push(notification)
    
    // Add to target player's current turn notifications
    if (!state.currentTurnNotifications[targetPlayer]) {
        state.currentTurnNotifications[targetPlayer] = []
    }
    state.currentTurnNotifications[targetPlayer].push(notification)
    
    return state;
}
