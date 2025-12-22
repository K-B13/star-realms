import { PID } from "./events";

export interface BaseInstance {
    id: string;
    shield: 'outpost' | 'normal';
    defence: number;
    damage: number;
    activatedThisTurn: boolean;
}

export interface CombatNotification {
    id: string;
    targetPlayer: PID;
    attacker: PID;
    amount: number;
    targetType: 'player' | 'base';
    baseName?: string;
    baseDestroyed?: boolean;
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
    eliminationOrder: number; 
}

export interface GameState {
    order: string[];
    activeIndex: number;
    players: Record<string, PlayerState>;
    playerNames?: Record<string, string>; 
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
    combatLog: CombatNotification[]; 
    currentTurnNotifications: Record<string, CombatNotification[]>; 
}
