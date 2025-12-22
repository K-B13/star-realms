'use client'
import { useMemo, useState, useRef } from "react";
import { replay, materialize } from "../engine/recompute";
import { Event, Zone } from "../engine/events";
import { initialSetup } from "../engine/initialSetup";
import { useSearchParams } from "next/navigation";
import { Player } from "../offlineLobby/page";
import { GameState } from "../engine/state";

// Import new components
import TradeRowSection from "./components/TradeRowSection";
import PlayerSummaryBar from "./components/PlayerSummaryBar";
import OpponentBasesViewer from "./components/OpponentBasesViewer";
import CurrentPlayerBases from "./components/CurrentPlayerBases";
import PlayerHand from "./components/PlayerHand";
import CardDetailOverlay from "./components/CardDetailOverlay";

// Import existing overlays (you'll wire these up)
import ScrapPromptOverlay from "../promptOverlays/tradeRowOverlay";
import OpponentDiscardOverlay from "../promptOverlays/opponentDiscardOverlay";
import OpponentChoiceOverlay from "../promptOverlays/opponentChoiceOverlay";
import ChooseToScrapOverlay from "../promptOverlays/chooseToScrapOverlay";
import ChooseOtherCardToScrapOverlay from "../promptOverlays/chooseOtherCardToScrapOverlay";
import ChooseAbilityOverlay from "../promptOverlays/chooseAbilityOverlay";
import ChooseCardToCopyOverlay from "../promptOverlays/chooseCardToCopyOverlay";
import ChooseOpponentBaseOverlay from "../promptOverlays/chooseOpponentBaseOverlay";
import DiscardAndDrawOverlay from "../promptOverlays/discardAndDrawOverlay";
import { getActivePrompt } from "../helperFunctions/activePromptFunction";
import { CardDef, cardRegistry } from "../engine/cards";
import DiscardDeckOverlay from "./components/DiscardDeckOverlay";
import DeckOverlay from "./components/DeckOverlay";
import ScrapOverlay from "./components/ScrapOverlay";
import TradeRowDeckOverlay from "./components/TradeRowDeckOverlay";
import GameOverOverlay from "./components/GameOverOverlay";
import CombatNotificationOverlay from "./components/CombatNotificationOverlay";
import { CombatNotification } from "../engine/state";
import { useEffect } from "react";
import LogOverlay from "./components/LogOverlay";

export default function NewGamePage() {
    const searchParams = useSearchParams();
    const playersParam = searchParams.get('players');
    const [showDiscardDeck, setShowDiscardDeck] = useState(false);
    const [showDeck, setShowDeck] = useState(false);
    const [showScrap, setShowScrap] = useState(false);
    const [showTradeDeck, setShowTradeDeck] = useState(false);
    const [showCombatPopup, setShowCombatPopup] = useState(false);
    const [combatNotifications, setCombatNotifications] = useState<CombatNotification[]>([]);
    const [showLog, setShowLog] = useState(false);
    
    // Parse players from URL
    const players: Player[] = useMemo(() => {
        if (!playersParam) return [];
        try {
            return JSON.parse(decodeURIComponent(playersParam));
        } catch {
            return [];
        }
    }, [playersParam]);

    const playerNames = players.map(p => p.name);

    // Initialize game state
    const [turnEvents, setTurnEvents] = useState<Event[]>([]);
    const [snapshot, setSnapshot] = useState<GameState>(() => initialSetup(playerNames));

    // Card detail overlay state
    const [cardDetailState, setCardDetailState] = useState<{
        card: CardDef | null;
        isOpen: boolean;
        mode: 'hover' | 'click';
        onActivateBase?: () => void;
        baseAlreadyActivated?: boolean;
        onScrapBase?: () => void;
    }>({ card: null, isOpen: false, mode: 'hover' });
    
    // Ref to track hover timeout
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Compute current state
    const state = useMemo(() => {
        return replay(snapshot, turnEvents);
    }, [snapshot, turnEvents]);

    // Get current player
    const currentPlayerId = state.order[state.activeIndex];
    const currentPlayer = state.players[currentPlayerId];

    // Get active prompt
    const { prompt: activePrompt } = getActivePrompt(turnEvents)

    // Show combat notifications on turn start
    useEffect(() => {
        const notifications = state.currentTurnNotifications[currentPlayerId] || [];
        
        if (notifications.length > 0) {
            setCombatNotifications(notifications);
            setShowCombatPopup(true);
        }
    }, [state.activeIndex, currentPlayerId, state.currentTurnNotifications]);

    // Append events function with rule expansion
    const append = (root: Event | Event[]) => {
        setTurnEvents(prev => {
            const base = replay(snapshot, prev);
            const roots = Array.isArray(root) ? root : [root];
            const { events: expandedNew } = materialize(base, roots);
            return [...prev, ...expandedNew];
        });
    };

    const handleSelectTradeCard = (card: CardDef, source: 'row' | 'explorer', index: number) => {
        append([
            { t: 'CardPurchased', player: currentPlayerId, card: card.id, source: source, rowIndex: index },
            { t: 'TradeSpent', player: currentPlayerId, card: card.id, amount: card.cost }
        ])
        // Close the overlay when buying a card
        forceCloseCardDetail();
    };

    const handlePlayCard = (card: CardDef, cardIndex: number) => {
        if (card.type === 'base') {
            append({ t: 'BasePlayed', player: currentPlayerId, handIndex: cardIndex, card: card.id })
        } else {
            append({ t: 'CardPlayed', player: currentPlayerId, handIndex: cardIndex })
        }
    };

    const handleActivateBase = (baseIndex: number) => {
        append({ t: 'BaseActivated', player: currentPlayerId, baseIndex })
    };

    const handleScrapCard = (card: CardDef, from: Zone, cardIndex: number) => {
        append({ t: 'CardScrapped', player: currentPlayerId, from, placementIndex: cardIndex, card: card.id })
    };

    const handleScrapTradeRow = (idx: number, card: string, currentPlayer: string) => {
        handleScrapCard(cardRegistry[card], 'row', idx)
    }

    const handleFreeCard = (idx: number, card: string, currentPlayer: string) => {
        append([
            { t: 'NextAcquireFreeSet', player: currentPlayer },
            { t: 'NextAcquireToTopSet', player: currentPlayer },
            { t: 'CardPurchased', player: currentPlayer, card: card, source: 'row', rowIndex: idx },
            { t: "TradeSpent", player: state.order[state.activeIndex], card: card, amount: cardRegistry[card].cost }
        ])
    }

    const handleScrapBase = (baseIndex: number) => {
        const base = currentPlayer.bases[baseIndex];
        append({ t: 'CardScrapped', player: currentPlayerId, from: 'bases', placementIndex: baseIndex, card: base.id })
    };

    const handleViewDiscard = () => {
        setShowDiscardDeck(true);
    };

    const closeViewDiscard = () => {
        setShowDiscardDeck(false);
    }

    const handleViewDeck = () => {
        setShowDeck(true);
    };

    const closeViewDeck = () => {
        setShowDeck(false);
    };

    const handleViewScrap = () => {
        setShowScrap(true);
    };

    const closeViewScrap = () => {
        setShowScrap(false);
    };

    const handleViewTradeDeck = () => {
        setShowTradeDeck(true);
    };

    const closeViewTradeDeck = () => {
        setShowTradeDeck(false);
    };

    const handleEndTurn = () => {
        const base = replay(snapshot, turnEvents);
        const { state: endState } = materialize(base, [{ t: 'PhaseChanged', from: 'MAIN', to: 'CLEANUP' }]);

        setSnapshot(endState)
        setTurnEvents([])
    }

    // Card detail handlers
    const showCardDetail = (card: CardDef, mode: 'hover' | 'click', onActivateBase?: () => void, baseAlreadyActivated?: boolean, onScrapBase?: () => void) => {
        // Clear any pending hide timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setCardDetailState({ card, isOpen: true, mode, onActivateBase, baseAlreadyActivated, onScrapBase });
    };

    const hideCardDetail = () => {
        // Don't hide if in click mode - user must click close button or outside
        if (cardDetailState.mode === 'click') {
            return;
        }
        
        // For hover mode, add a small delay before hiding
        // This prevents flickering when moving between card and overlay
        hoverTimeoutRef.current = setTimeout(() => {
            setCardDetailState({ card: null, isOpen: false, mode: 'hover' });
        }, 100);
    };

    const forceCloseCardDetail = () => {
        // Force close regardless of mode (for click mode close button/backdrop)
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setCardDetailState({ card: null, isOpen: false, mode: 'hover' });
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-2.5 h-full">
                
                <TradeRowSection 
                    tradeDeck={state.tradeDeck}
                    tradeRow={state.row}
                    explorerDeck={state.explorerDeck}
                    scrapPileCount={state.scrap.length}
                    onSelectCard={handleSelectTradeCard}
                    onCardHover={showCardDetail}
                    onCardLeave={hideCardDetail}
                    onCardClick={showCardDetail}
                    onViewTradeDeck={handleViewTradeDeck}
                />

                <PlayerSummaryBar 
                    players={state.players}
                    playerOrder={state.order}
                    activeIndex={state.activeIndex}
                    currentPlayerId={currentPlayerId}
                    append={append}
                />

                <OpponentBasesViewer 
                    players={state.players}
                    playerOrder={state.order}
                    currentPlayerId={currentPlayerId}
                    append={append}
                />

                <CurrentPlayerBases 
                    bases={currentPlayer.bases}
                    playerId={currentPlayerId}
                    onActivateBase={handleActivateBase}
                    onScrapBase={handleScrapBase}
                    onCardHover={showCardDetail}
                    onCardLeave={hideCardDetail}
                />

                <PlayerHand 
                    player={currentPlayer}
                    currentPlayerId={currentPlayerId}
                    turnPlayerId={state.order[state.activeIndex]}
                    onPlayCard={handlePlayCard}
                    onScrapCard={handleScrapCard}
                    onViewDiscard={handleViewDiscard}
                    onViewDeck={handleViewDeck}
                    onViewScrap={handleViewScrap}
                    onEndTurn={handleEndTurn}
                    onCardClick={showCardDetail}
                    onToggleLog={() => setShowLog(!showLog)}
                    scrapPileCount={state.scrap.length}
                />

            </div>

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapRow' && (
                <ScrapPromptOverlay 
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    handleFunction={handleScrapTradeRow}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseRowForFree' && (
                <ScrapPromptOverlay 
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    handleFunction={handleFreeCard}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'opponentDiscard' && (
                <OpponentDiscardOverlay
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={state.order[state.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && (activePrompt.kind === 'opponentChoice' || activePrompt.kind === 'choosePlayer') && (
                <OpponentChoiceOverlay
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={state.order[state.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapSelf' && (
                <ChooseToScrapOverlay
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={state.order[state.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseOtherCardToScrap' && (
                <ChooseOtherCardToScrapOverlay
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={state.order[state.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseAbility' && (
                <ChooseAbilityOverlay
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={state.order[state.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && (activePrompt.kind === 'copyShip' || activePrompt.kind === 'chooseInPlayShip') && (
                <ChooseCardToCopyOverlay
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={state.order[state.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseOpponentBase' && (
                <ChooseOpponentBaseOverlay
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={state.order[state.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'discardOrScrapAndDraw' && (
                <DiscardAndDrawOverlay
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={state.order[state.activeIndex]}
                />
            )}

            <CardDetailOverlay
                card={cardDetailState.card}
                isOpen={cardDetailState.isOpen}
                onClose={forceCloseCardDetail}
                mode={cardDetailState.mode}
                onMouseEnter={() => {
                    if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = null;
                    }
                }}
                onMouseLeave={hideCardDetail}
                onActivateBase={cardDetailState.onActivateBase}
                showActivateButton={!!cardDetailState.onActivateBase}
                baseAlreadyActivated={cardDetailState.baseAlreadyActivated}
                onScrapBase={cardDetailState.onScrapBase}
                showScrapButton={!!cardDetailState.onScrapBase}
            />
            {
                showDiscardDeck &&
                <DiscardDeckOverlay
                    currentPlayer={currentPlayer}
                    onClose={closeViewDiscard}
                />
            }
            {
                showDeck &&
                <DeckOverlay
                    currentPlayer={currentPlayer}
                    onClose={closeViewDeck}
                />
            }
            {
                showScrap &&
                <ScrapOverlay
                    scrappedCards={state.scrap}
                    onClose={closeViewScrap}
                />
            }
            {
                showTradeDeck &&
                <TradeRowDeckOverlay
                    tradeDeck={state.tradeDeck}
                    onClose={closeViewTradeDeck}
                />
            }
            
            <GameOverOverlay
                state={state}
                onNewGame={() => {
                    setTurnEvents([]);
                    setSnapshot(initialSetup(playerNames));
                }}
            />

            {showCombatPopup && (
                <CombatNotificationOverlay
                    notifications={combatNotifications}
                    playerNames={Object.fromEntries(state.order.map(id => [id, id]))}
                    onClose={() => {
                        setShowCombatPopup(false);
                        setCombatNotifications([]);
                        // Clear the notifications from the state to prevent them from reappearing
                        setSnapshot(prev => ({
                            ...prev,
                            currentTurnNotifications: {
                                ...prev.currentTurnNotifications,
                                [currentPlayerId]: []
                            }
                        }));
                    }}
                />
            )}

            {showLog && (
                <LogOverlay
                    log={state.log}
                    players={state.order}
                    currentPlayerId={currentPlayerId}
                    onClose={() => setShowLog(false)}
                />
            )}
        </div>
    );
}
