
export type Phase = 'MAIN'|'CLEANUP';
export type PID = string;

export type Event =
  | { t: 'CardPlayed'; player: PID; handIndex: number }
  | { t: 'TradeAdded'; player: PID; amount: number }
  | { t: 'CombatAdded'; player: PID; amount: number }
  | { t: 'AuthorityAdded'; player: PID; amount: number }
  | { t: 'TradeSpent'; player: PID; card: string; amount: number }
  | { t: 'CardPurchased'; player: PID;  card: string; to: 'discard'|'top'; rowIndex?: number; source: 'row' | 'explorer' }
  | { t: 'RowRefilled'; rowIndex: number }
  | { t: 'CardScrapped'; player: PID; card: string; from: 'hand'|'inPlay'|'discard' }
  | { t: 'CardsDrawn'; player: PID; count: number }
  | { t: "DrawOne", player: PID, counter?: number }
  | { t: 'DeckShuffle'; player: PID, newDeck: string[] }
  | { t: 'DiscardInPlayAndHand'; player: PID }
  | { t: 'DamageDealt'; from: PID; to: PID; amount: number }
  | { t: 'TurnAdvanced' }
  | { t: 'PhaseChanged'; from: Phase; to: Phase }
  | { t: 'PromptShown'; player: PID; kind: string; optional?: boolean; data?: unknown }
  | { t: 'PromptCancelled' };