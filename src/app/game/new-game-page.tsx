'use client'
import { useMemo, useState } from "react";
import { replay, materialize } from "../engine/recompute";
import { Event, Zone } from "../engine/events";
import { initialSetup } from "../engine/initialSetup";
import { useSearchParams } from "next/navigation";
import { Player } from "../lobby/page";
import { GameState } from "../engine/state";

// Import new components
import TradeRowSection from "./components/TradeRowSection";
import PlayerSummaryBar from "./components/PlayerSummaryBar";
import OpponentBasesViewer from "./components/OpponentBasesViewer";
import CurrentPlayerBases from "./components/CurrentPlayerBases";
import PlayerHand from "./components/PlayerHand";

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

export default function NewGamePage() {
    const searchParams = useSearchParams();
    const playersParam = searchParams.get('players');
    
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

    // Compute current state
    const state = useMemo(() => {
        return replay(snapshot, turnEvents);
    }, [snapshot, turnEvents]);

    // Get current player
    const currentPlayerId = state.order[state.activeIndex];
    const currentPlayer = state.players[currentPlayerId];

    // Get active prompt
    const { prompt: activePrompt } = getActivePrompt(turnEvents)

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
        console.log('View discard');
        // Wire up: show discard pile modal/overlay
    };

    const handleViewDeck = () => {
        console.log('View deck');
        // Wire up: show deck modal/overlay
    };

    const handleEndTurn = () => {
        const base = replay(snapshot, turnEvents);
        const { state: endState } = materialize(base, [{ t: 'PhaseChanged', from: 'MAIN', to: 'CLEANUP' }]);

        setSnapshot(endState)
        setTurnEvents([])
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-2.5 h-full">
                
                <TradeRowSection 
                    tradeDeck={state.tradeDeck}
                    tradeRow={state.row}
                    explorerDeck={state.explorerDeck}
                    scrapPileCount={state.scrap.length}
                    onSelectCard={handleSelectTradeCard}
                />

                <PlayerSummaryBar 
                    players={state.players}
                    playerOrder={state.order}
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
                />

                <PlayerHand 
                    player={currentPlayer}
                    onPlayCard={handlePlayCard}
                    onScrapCard={handleScrapCard}
                    onViewDiscard={handleViewDiscard}
                    onViewDeck={handleViewDeck}
                    onEndTurn={handleEndTurn}
                />

            </div>

            {/* OVERLAYS - Wire these up to show based on activePrompt */}
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
        </div>
    );
}
