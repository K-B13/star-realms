import { CardDef } from "./cards";

export interface PlayerState {
    id: string;
    authority: number;
    deck: string[];
    hand: string[];
    discard: string[];
    inPlay: string[];
    // bases: Array<{ cardId: string; damage: number }>;
    acquireLocation: "top" | "discard";
    combat: number;
    trade: number;
}

export interface GameState {
    order: string[];
    activeIndex: number;
    players: Record<string, PlayerState>;
    row: string[];
    tradeDeck: string[];
    explorerDeck: string[];
    scrap: string[];
    turn: { phase: 'MAIN' | 'CLEANUP', playedThisTurn: string[] }
    prompt: null | { kind: string; player: string; optional?: boolean; data?: unknown}
    log: string[];
}
