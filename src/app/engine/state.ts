export interface BaseInstance {
    id: string;
    shield: 'outpost' | 'normal';
    defence: number;
    damage: number;
    activatedThisTurn: boolean;
}

export interface PlayerState {
    id: string;
    authority: number;
    deck: string[];
    hand: string[];
    discard: string[];
    inPlay: string[];
    bases: BaseInstance[];
    acquireLocation: "top" | "discard";
    combat: number;
    trade: number;
    freeNextAcquire: boolean;
    factionTags: Record<string, number>;
    isDead: boolean;
    eliminationOrder: number; // 0 = not eliminated, 1 = first to die, 2 = second to die, etc.
}

export interface GameState {
    order: string[];
    activeIndex: number;
    players: Record<string, PlayerState>;
    playerNames?: Record<string, string>; // Maps UID -> display name (optional for backwards compatibility)
    row: string[];
    tradeDeck: string[];
    explorerDeck: string[];
    scrap: string[];
    turn: { phase: 'MAIN' | 'CLEANUP', playedThisTurn: string[] }
    prompt: null | { kind: string; player: string; optional?: boolean; data?: unknown}
    log: string[];
    gameOver: boolean;
    winner: string | null;
    eliminationCount: number; 
}
