'use client'
import { useMemo, useState } from "react";
import { replay } from "../engine/recompute";
import { Event } from "../engine/events";
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

    // Append events function - YOU WIRE THIS UP
    const append = (event: Event | Event[]) => {
        const events = Array.isArray(event) ? event : [event];
        setTurnEvents(prev => [...prev, ...events]);
    };

    // Handler functions - YOU WIRE THESE UP
    const handleSelectTradeCard = (card: string, index: number) => {
        console.log('Select trade card:', card, index);
        // Wire up: append trade row selection event
    };

    const handlePlayCard = (cardIndex: number) => {
        console.log('Play card:', cardIndex);
        // Wire up: append card played event
    };

    const handleActivateBase = (baseIndex: number) => {
        console.log('Activate base:', baseIndex);
        // Wire up: append base activated event
    };

    const handleViewDiscard = () => {
        console.log('View discard');
        // Wire up: show discard pile modal/overlay
    };

    const handleViewDeck = () => {
        console.log('View deck');
        // Wire up: show deck modal/overlay
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-2.5 h-full">
                
                {/* TOP SECTION: Trade Row & Explorers */}
                <TradeRowSection 
                    tradeDeck={state.tradeDeck}
                    tradeRow={state.row}
                    explorerDeck={state.explorerDeck}
                    onSelectCard={handleSelectTradeCard}
                />

                {/* PLAYER SUMMARY BAR */}
                <PlayerSummaryBar 
                    players={state.players}
                    playerOrder={state.order}
                    currentPlayerId={currentPlayerId}
                />

                {/* OPPONENT BASES VIEWER */}
                <OpponentBasesViewer 
                    players={state.players}
                    playerOrder={state.order}
                    currentPlayerId={currentPlayerId}
                />

                {/* CURRENT PLAYER BASES */}
                <CurrentPlayerBases 
                    bases={currentPlayer.bases}
                    playerId={currentPlayerId}
                    onActivateBase={handleActivateBase}
                />

                {/* CURRENT PLAYER HAND */}
                <PlayerHand 
                    player={currentPlayer}
                    onPlayCard={handlePlayCard}
                    onViewDiscard={handleViewDiscard}
                    onViewDeck={handleViewDeck}
                />

            </div>

            {/* OVERLAYS - Wire these up to show based on activePrompt */}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapRow' && (
                <ScrapPromptOverlay 
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    handleFunction={() => {}} // Wire up
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseRowForFree' && (
                <ScrapPromptOverlay 
                    state={state}
                    activePrompt={activePrompt}
                    append={append}
                    handleFunction={() => {}} // Wire up
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

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'opponentChoice' && (
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

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapOther' && (
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

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'copyShip' && (
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
