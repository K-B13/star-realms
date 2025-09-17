import { BaseType } from "./base";
import { CardType } from "./card";

export interface PlayerType {
    name: string,
    host: boolean,
    uid: string,
    authority: number,
    trade: number;
    combatPower: number;
    factions: {
        "Trade Federation": number,
        "Machine Cult": number,
        "The Blob": number,
        "Star Empire": number
    }
    deck: CardType[],
    hand: CardType[],
    discard: CardType[],
    bases: BaseType[],
    status: 'alive' | 'eliminated'
    nextCardLocation: 'deck' | 'discard' | 'hand',
    trackShipsPlayed: boolean
    cardsPlayedThisTurn: CardType[]
}

export const playerFactoryFunction = (name: string, host: boolean, uid: string) => {
    // create the 8 scouts and 2 vipers.
    const player: PlayerType = {
        name,
        host,
        uid,
        authority: 50,
        trade: 0,
        combatPower: 0,
        factions: {
            "Trade Federation": 0,
            "Machine Cult": 0,
            "The Blob": 0,
            "Star Empire": 0
        },
        deck: [],
        hand: [],
        discard: [],
        bases: [],
        status: 'alive',
        nextCardLocation: 'discard',
        trackShipsPlayed: false,
        cardsPlayedThisTurn: []
    }
    return player
}

export const shuffleDeck = (deck: CardType[]) => {
    for (let i = deck.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [deck[i], deck[j]] = [deck[j], deck[i]];
    } 
}

export const drawCard = (player: PlayerType) => {
    if(player.deck.length === 0) refreshDeck(player)
    const drawnCard = player.deck.pop()
    if (!drawnCard) return
    player.hand.push(drawnCard)
}

export const startTurnDraw = (player: PlayerType) => {
    for(let i = 1; i <= 5; i++) {
        drawCard(player)
    }    
}

export const startTurn = (player: PlayerType) => {
    player.trade = 0
    player.combatPower = 0
    player.factions = {
        "Trade Federation": 0,
        "Machine Cult": 0,
        "The Blob": 0,
        "Star Empire": 0
    }
    player.nextCardLocation = 'discard'
    player.trackShipsPlayed = false
    startTurnDraw(player)
}

export const refreshDeck = (player: PlayerType) => {
    player.deck = player.discard
    player.discard = []
    shuffleDeck(player.deck)
}

export const discardCard = (player: PlayerType, card: CardType) => {
    player.hand = player.hand.filter(item => item.id !== card.id)
    player.discard.push(card)
}

export const removeBase = (player: PlayerType, targetBase: BaseType) => {
    player.bases = player.bases.filter(base => base.id !== targetBase.id)
    player.discard.push(targetBase)
}

export const addCombatPower = (player: PlayerType, amount: number) => {
    player.combatPower += amount
}

export const addTrade = (player: PlayerType, amount: number) => {
    player.trade += amount
}

export const addAuthority = (player: PlayerType, amount: number) => {
    player.authority += amount
}

export const takeShieldDamage = (player: PlayerType, selectedBase: BaseType, damage: number) => {
    const targetedBase = player.bases.find(base => base.id === selectedBase.id) as BaseType
    if (damage < targetedBase.shield) {
        targetedBase.shield -= damage
        return
    }
    damage -= targetedBase.shield
    player.bases = [...player.bases.filter(base => base.id !== selectedBase.id)]
    if (player.bases.length === 0) {
        player.authority -= damage
        return
    }
    return damage
}

export const takeDamage = (player: PlayerType, damage: number) => {
    const leftover = player.authority - damage
    if (leftover <= 0) {
        player.authority = 0
        player.status = 'eliminated'
        return leftover * -1
    }
    player.authority = leftover
}

// will need to handle removal of the card on the frontend
export const cardAcquisition = (player: PlayerType, card: CardType, free?: boolean) => {
    if (player.trade < card.cost) return
    player[player.nextCardLocation].push(card)
    player.nextCardLocation = 'discard'
    if (free) return
    player.trade -= card.cost
    return player.trade
}

    
    
