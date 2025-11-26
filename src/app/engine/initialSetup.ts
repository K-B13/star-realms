import { baseCards } from "./baseDeck"
import { GameState, PlayerState } from "./state"

export const playerSetup: (playerName: string) => PlayerState = (playerName: string) => {
    return {
        id: playerName,
        authority: 50,
        deck: [],
        hand: [],
        discard: [],
        inPlay: [],
        acquireLocation: "discard",
        freeNextAcquire: false,
        factionTags: {},
        combat: 0,
        trade: 0,
        bases: [],
    }
}

export const startingDeck = () => {
    const deck = []
    for (let i = 1; i <= 10; i++) {
        if (i <= 8) {
            deck.push('SCOUT')
        } else {
            deck.push('VIPER')
        }
    }
    return deck
}

export const explorerDeck = () => {
    const deck = []
    for (let i = 1; i <= 10; i++) {
        deck.push('EXPLORER')
    }
    return deck
}

export const shuffle = <T,>(arr: T[]): T[] => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const createTradeRow = () => {
    const deck: string[] = []
    baseCards.forEach(card => {
        for (let i = 0; i < card.amount; i++) {
            deck.push(card.cardName)
        }
    })
    return deck
}

export const drawN = (deck: string[], discard: string[], n: number) => {
    const hand: string[] = [];
    let currentDeck = deck.slice();
    let currentDiscard = discard.slice();

    for (let i = 0; i < n; i++) {
        if (currentDeck.length === 0 && currentDiscard.length > 0) {
            currentDeck = shuffle(currentDiscard);
            currentDiscard = [];
        }
        if (currentDeck.length === 0) {
            break;
        }
        hand.push(currentDeck[0]);
        currentDeck = currentDeck.slice(1);
    }

    return { hand, deck: currentDeck, discard: currentDiscard }
}

export const initialSetup = (playerNames: string[]) => {
    const playersArr = playerNames.map(playerName => {
        const player: PlayerState = playerSetup(playerName)
        const deck = shuffle(startingDeck())
        const { hand, deck: rest } = drawN(deck, [], 5)
        player.hand = hand
        player.deck = rest
        return player
    })
    const explorers = explorerDeck()
    const tradeDeck: string[] = shuffle(createTradeRow())
    const row: string[] = tradeDeck.splice(0, 5);

    const state: GameState = {
        order: playerNames,
        activeIndex: 0,
        players: Object.fromEntries(playersArr.map(player => [player.id, player])),
        tradeDeck,
        row,
        explorerDeck: explorers,
        scrap: [],
        turn: { phase: 'MAIN', playedThisTurn: [] },
        prompt: null,
        log: []
    }

    return state
}

