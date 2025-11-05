import { initialSetup, shuffle } from "./initialSetup";
import type { GameState } from "./state";
import type { Event } from "./events";
import { cardRegistry } from "./cards";

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
        for (const ability of def.abilities) {
            if (ability.trigger !== 'onPlay') continue;
            for (const effect of ability.effects) {
              switch (effect.kind) {
                case 'addTrade':
                  emit({ t: 'TradeAdded', player: ev.player, amount: effect.amount });
                  break;
                case 'addCombat':
                  emit({ t: 'CombatAdded', player: ev.player, amount: effect.amount });
                  break;
                case 'addAuthority':
                  emit({ t: 'AuthorityAdded', player: ev.player, amount: effect.amount });
                  break;
                case 'drawCards':
                  emit({ t: 'CardsDrawn', player: ev.player, count: effect.amount });
                  break;
                case 'nextAcquireTop':
                  emit({ t: 'NextAcquireToTopSet', player: ev.player });
                  break;
                case 'prompt':
                  emit({
                    t: 'PromptShown',
                    player: ev.player,
                    kind: effect.prompt.kind,
                    optional: effect.prompt.optional,
                    data: effect.prompt.data
                  });
                  break;
                }
            }
        }
    }
}

const allyRule: Rule<'CardPlayed'> = {
    on: 'CardPlayed',
    run: (state, ev, emit) => {
        const justPlayed = state.players[ ev.player ].inPlay[state.players[ ev.player ].inPlay.length - 1];
        const def = cardRegistry[ justPlayed ];
        const faction = def.faction;
        const factionCounter = state.players[ ev.player ].inPlay.reduce((acc, card) => {
            const cardDef = cardRegistry[ card ];
            if (cardDef.faction === faction) acc++;
            return acc;
        }, 0);
        if (factionCounter <= 1) return;
        for (const ability of def.abilities) {
            if (ability.trigger !== 'onAlly') continue;
            for (const effect of ability.effects) {
              switch (effect.kind) {
                case 'addTrade':
                  emit({ t: 'TradeAdded', player: ev.player, amount: effect.amount });
                  break;
                case 'addCombat':
                  emit({ t: 'CombatAdded', player: ev.player, amount: effect.amount });
                  break;
                case 'addAuthority':
                  emit({ t: 'AuthorityAdded', player: ev.player, amount: effect.amount });
                  break;
                case 'drawCards':
                  emit({ t: 'CardsDrawn', player: ev.player, count: effect.amount });
                  break;
                case 'nextAcquireTop':
                  emit({ t: 'NextAcquireToTopSet', player: ev.player });
                  break;
                case 'prompt':
                  emit({
                    t: 'PromptShown',
                    player: ev.player,
                    kind: effect.prompt.kind,
                    optional: effect.prompt.optional,
                    data: effect.prompt.data
                  });
                  break;
                }
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
        if (filledInCard.cost > state.players[ev.player].trade)  return;
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

const onScrapRules: Rule<'CardScrapped'> = {
    on: "CardScrapped",
    run: (state, ev, emit) => {
        if (ev.from === 'row') {
            emit({ t: 'RowRefilled', rowIndex: ev.rowIndex })   
        }
    }
}

const rules: Rule<Event['t']>[] = [ onPlayRule, allyRule, cleanupRule, refillRule, drawManyRule, ensureDeckRule, onScrapRules ] as Rule<Event['t']>[]

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
            removeOne(p.hand, event.handIndex);
            p.inPlay.push(card);
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
            if (cardRegistry[event.card].cost > state.players[event.player].trade) return state
            const currentPlayer = state.players[ event.player ];
            currentPlayer.trade = Math.max(0, currentPlayer.trade - event.amount);
            return state;
        case 'CardPurchased':
            const filledInCard = cardRegistry[ event.card ];
            if (filledInCard.cost > state.players[event.player].trade) { console.log('Not enough money'); return state };
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
                const cardAtSlot = state.row[event.rowIndex];
                state.scrap.push(cardAtSlot) 
            }
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
            state.players[event.player] = activePlayer;
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