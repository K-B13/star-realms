import { LogEntryType } from "./state";

export type Phase = 'MAIN'|'CLEANUP';
export type PID = string;
export type Zone = 'row' | 'hand' | 'inPlay' | 'discard' | 'bases'

export interface BaseEvent {
    timestamp: number;
}

export type Event =
  | { t: 'CardPlayed'; player: PID; handIndex: number } & BaseEvent
  | { t: 'TradeAdded'; player: PID; amount: number } & BaseEvent
  | { t: 'CombatAdded'; player: PID; amount: number } & BaseEvent
  | { t: 'AuthorityAdded'; player: PID; amount: number } & BaseEvent
  | { t: 'TradeSpent'; player: PID; card: string; amount: number } & BaseEvent
  | { t: 'CardPurchased'; player: PID;  card: string; rowIndex?: number; source: 'row' | 'explorer' } & BaseEvent
  | { t: 'RowRefilled'; rowIndex: number } & BaseEvent
  | { t: 'CardScrapped'; player: PID; from: Zone; placementIndex: number, card: string } & BaseEvent
  | { t: 'TargetChosen'; player: PID; target: string; purpose: string } & BaseEvent
  | { t: 'CardDiscarded'; player: PID; card: string; rowIndex: number } & BaseEvent
  | { t: 'CardsDrawn'; player: PID; count: number } & BaseEvent
  | { t: "DrawOne", player: PID, counter?: number } & BaseEvent
  | { t: 'DeckShuffle'; player: PID, newDeck: string[] } & BaseEvent
  | { t: 'DiscardInPlayAndHand'; player: PID } & BaseEvent
  | { t: 'DamageDealt'; from: PID; to: PID; amount: number } & BaseEvent
  | { t: 'PlayerDied'; player: PID } & BaseEvent
  | { t: 'GameOver'; winner: PID } & BaseEvent
  | { t: 'NextAcquireToTopSet'; player: PID } & BaseEvent
  | { t: 'NextAcquireFreeSet'; player: PID } & BaseEvent
  | { t: 'TargetCardChosen'; player: PID; source: 'copyShip'; inPlayIndex: number } & BaseEvent
  | { t: 'FactionTagAdded'; player: PID; faction: string; amount: number } & BaseEvent
  | { t: 'BasePlayed'; player: PID; card: string; handIndex: number } & BaseEvent  
  | { t: 'BaseDamaged'; player: PID; baseIndex: number; amount: number } & BaseEvent
  | { t: 'BaseDestroyed'; player: PID; baseIndex: number } & BaseEvent
  | { t: 'BaseChosenToDestroy'; player: PID; targetPlayer: PID; baseIndex: number } & BaseEvent
  | { t: 'TurnStarted'; player: PID } & BaseEvent
  | { t: 'BaseActivated'; player: PID; baseIndex: number } & BaseEvent
  | { t: 'TwoOrMoreBasesInPlay'; player: PID; amount: number } & BaseEvent
  | { t: 'DrawPerFactionCard'; card: string } & BaseEvent
  | { t: 'DiscardOrScrapAndDrawChosen'; player: PID; maxCards: number; action: 'discard' | 'scrap'  } & BaseEvent
  | { t: 'CardsDiscardedOrScrappedForDraw'; player: PID; discardedIndices: number[]; action: 'discard' | 'scrap' } & BaseEvent
  | { t: 'ShipPlayed'; player: PID; card: string } & BaseEvent
  | { t: 'TurnAdvanced' } & BaseEvent
  | { t: 'PhaseChanged'; from: Phase; to: Phase } & BaseEvent
  | { t: 'CombatNotification'; id: string; targetPlayer: PID; attacker: PID; amount: number; targetType: 'player' | 'base'; baseName?: string; baseDestroyed?: boolean } & BaseEvent
  | { t: 'Chat'; type: LogEntryType; content: string; from: string; to?: string } & BaseEvent
  | { t: 'PromptShown'; player: PID; kind: string; optional?: boolean; data?: unknown } & BaseEvent
  | { t: 'PromptCancelled'; kind: string } & BaseEvent;