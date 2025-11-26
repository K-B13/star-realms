
export type Phase = 'MAIN'|'CLEANUP';
export type PID = string;
export type Zone = 'row' | 'hand' | 'inPlay' | 'discard' | 'bases'

export type Event =
  | { t: 'CardPlayed'; player: PID; handIndex: number }
  | { t: 'TradeAdded'; player: PID; amount: number }
  | { t: 'CombatAdded'; player: PID; amount: number }
  | { t: 'AuthorityAdded'; player: PID; amount: number }
  | { t: 'TradeSpent'; player: PID; card: string; amount: number }
  | { t: 'CardPurchased'; player: PID;  card: string; rowIndex?: number; source: 'row' | 'explorer' }
  | { t: 'RowRefilled'; rowIndex: number }
  | { t: 'CardScrapped'; player: PID; from: Zone; placementIndex: number, card: string }
  | { t: 'TargetChosen'; player: PID; target: string; purpose: string }
  | { t: 'CardDiscarded'; player: PID; card: string; rowIndex: number }
  | { t: 'CardsDrawn'; player: PID; count: number }
  | { t: "DrawOne", player: PID, counter?: number }
  | { t: 'DeckShuffle'; player: PID, newDeck: string[] }
  | { t: 'DiscardInPlayAndHand'; player: PID }
  | { t: 'DamageDealt'; from: PID; to: PID; amount: number }
  | { t: 'NextAcquireToTopSet'; player: PID }
  | { t: 'NextAcquireFreeSet'; player: PID }
  | { t: 'TargetCardChosen'; player: PID; source: 'copyShip'; inPlayIndex: number }
  | { t: 'FactionTagAdded'; player: PID; faction: string; amount: number }
  | { t: 'BasePlayed'; player: PID; card: string; handIndex: number }  
  | { t: 'BaseDamaged'; player: PID; baseIndex: number; amount: number }
  | { t: 'BaseDestroyed'; player: PID; baseIndex: number }
  | { t: 'TurnStarted'; player: PID }
  | { t: 'BaseActivated'; player: PID; baseIndex: number }
  | { t: 'TwoOrMoreBasesInPlay'; player: PID, amount: number }
  | { t: 'TurnAdvanced' }
  | { t: 'PhaseChanged'; from: Phase; to: Phase }
  | { t: 'PromptShown'; player: PID; kind: string; optional?: boolean; data?: unknown }
  | { t: 'PromptCancelled' };