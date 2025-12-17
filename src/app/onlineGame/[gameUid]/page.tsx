'use client'
/**
 * ============================================================================
 * ONLINE GAME PAGE - Star Realms Multiplayer
 * ============================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * This component implements a real-time multiplayer game using Firebase Realtime Database.
 * 
 * DATA FLOW:
 * 1. Firebase stores the "source of truth" game state
 * 2. All players listen to the same Firebase path
 * 3. When a player takes an action → write to Firebase → all players receive update
 * 4. React re-renders with the new state → all players stay synchronized
 * 
 * KEY CONCEPTS:
 * - UIDs vs Names: Game state uses Firebase UIDs as player IDs, names are for display only
 * - currentUserId: The logged-in user (constant per session)
 * - currentPlayerId: Whose turn it is (changes each turn)
 * - myPlayer: The logged-in user's hand/bases (what they see)
 * - isMyTurn: Whether the logged-in user can take actions
 * 
 * FIREBASE PATHS:
 * - setup/lobbies/{gameUid} → Lobby data (player names, host)
 * - games/{gameUid}/gameState → Current game state (cards, players, turn)
 * - games/{gameUid}/events → (TODO) Event queue for actions
 * 
 * SYNCHRONIZATION:
 * - useEffect #1: Listen to auth state → know who is logged in
 * - useEffect #2: Listen to lobby data → map UIDs to names
 * - useEffect #3: Listen to game state → receive updates from all players
 * - useEffect #4: Initialize game (host only) → create initial state
 * 
 * ============================================================================
 */
import { useState, useEffect, useRef } from "react"
import { onValue, ref } from "firebase/database"
import { useParams, useRouter } from "next/navigation"
import { db, auth } from "../../firebase/firebaseConfig"
import { lobbyPath, gameStatePath, eventPath } from "@/app/firebase/firebasePaths"
import { GameState, PlayerState } from "../../engine/state"
import { LobbyInterface } from "../../lobbyCreation/page"
import { initialSetup } from "../../engine/initialSetup"
import { writeValue } from "../../firebase/firebaseActions"
import { CardDef, cardRegistry } from "../../engine/cards"
import { materialize, replay } from "../../engine/recompute"

// Import components from offline game
import TradeRowSection from "../../game/components/TradeRowSection"
import PlayerSummaryBar from "../../game/components/PlayerSummaryBar"
import OpponentBasesViewer from "../../game/components/OpponentBasesViewer"
import CurrentPlayerBases from "../../game/components/CurrentPlayerBases"
import PlayerHand from "../../game/components/PlayerHand"
import CardDetailOverlay from "../../game/components/CardDetailOverlay"
import { Event, Zone } from "@/app/engine/events"
import ScrapPromptOverlay from "@/app/promptOverlays/tradeRowOverlay"
import { getActivePrompt } from "@/app/helperFunctions/activePromptFunction"
import OpponentDiscardOverlay from "@/app/promptOverlays/opponentDiscardOverlay"
import OpponentChoiceOverlay from "@/app/promptOverlays/opponentChoiceOverlay"
import ChooseToScrapOverlay from "@/app/promptOverlays/chooseToScrapOverlay"
import ChooseOtherCardToScrapOverlay from "@/app/promptOverlays/chooseOtherCardToScrapOverlay"
import ChooseAbilityOverlay from "@/app/promptOverlays/chooseAbilityOverlay"
import ChooseCardToCopyOverlay from "@/app/promptOverlays/chooseCardToCopyOverlay"
import ChooseOpponentBaseOverlay from "@/app/promptOverlays/chooseOpponentBaseOverlay"
import DiscardAndDrawOverlay from "@/app/promptOverlays/discardAndDrawOverlay"
import DeckOverlay from "@/app/game/components/DeckOverlay"
import ScrapOverlay from "@/app/game/components/ScrapOverlay"
import TradeRowDeckOverlay from "@/app/game/components/TradeRowDeckOverlay"
import DiscardDeckOverlay from "@/app/game/components/DiscardDeckOverlay"
import GameOverOverlay from "@/app/game/components/GameOverOverlay"

export default function OnlineGamePage() {
    const [gameState, setGameState] = useState<GameState>({
        order: [],
        activeIndex: 0,
        players: {},
        tradeDeck: [],
        row: [],
        explorerDeck: [],
        scrap: [],
        turn: { phase: 'MAIN', playedThisTurn: [] },
        prompt: null,
        log: [],
        gameOver: false,
        winner: null,
        eliminationCount: 0,
    })
    const [lobby, setLobby] = useState<LobbyInterface | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [isGameReady, setIsGameReady] = useState(false)
    const [turnEvents, setTurnEvents] = useState<Event[]>([])
    const params = useParams()
    const router = useRouter()
    const gameUid = params.gameUid as string

    // UI state (same as offline game)
    const [showDiscardDeck, setShowDiscardDeck] = useState(false)
    const [showDeck, setShowDeck] = useState(false)
    const [showScrap, setShowScrap] = useState(false)
    const [showTradeDeck, setShowTradeDeck] = useState(false)
    
    // Error notification state
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    
    // Card detail overlay state
    const [cardDetailState, setCardDetailState] = useState<{
        card: CardDef | null;
        isOpen: boolean;
        mode: 'hover' | 'click';
        onActivateBase?: () => void;
        baseAlreadyActivated?: boolean;
        onScrapBase?: () => void;
        buttonMode?: 'activate' | 'attack';
    }>({ card: null, isOpen: false, mode: 'hover' })
    
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    /**
     * useEffect #1: Authentication Listener
     * 
     * WHAT: Listens to Firebase authentication state changes
     * WHY: We need to know which user is logged in to determine:
     *      - Which player's hand/bases to show
     *      - Whether it's the current user's turn
     *      - Which player can take actions
     * 
     * DEPENDENCIES: [] (empty array)
     *      - Runs once on component mount
     *      - Sets up a persistent listener that stays active
     *      - Cleanup function unsubscribes when component unmounts
     * 
     * FLOW:
     *      1. Component mounts → listener is set up
     *      2. User logs in/out → callback fires → setCurrentUserId updates
     *      3. Component unmounts → cleanup runs → listener is removed
     */
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUserId(user.uid)
            }
        })
        return () => unsubscribe()
    }, [])

    /**
     * useEffect #2: Lobby Data Listener
     * 
     * WHAT: Listens to the lobby data in Firebase for this specific game
     * WHY: We need lobby data to:
     *      - Map player UIDs to display names (lobby.players[uid].name)
     *      - Know who the host is
     *      - Redirect if the lobby is deleted/doesn't exist
     * 
     * DEPENDENCIES: [gameUid, router]
     *      - gameUid: Re-run if the game ID changes (shouldn't happen, but safety)
     *      - router: Required for the redirect, included for React exhaustive-deps
     * 
     * FLOW:
     *      1. Component mounts → listener subscribes to Firebase path: setup/lobbies/{gameUid}
     *      2. Lobby data changes → callback fires → setLobby updates
     *      3. If lobby deleted → redirect to lobby selection
     *      4. Component unmounts or gameUid changes → cleanup runs → listener removed
     * 
     * NOTE: This stays subscribed even after game starts because we need player names
     */
    useEffect(() => {
        const unsubscribe = onValue(ref(db, lobbyPath(gameUid)), (snapshot) => {
            const data = snapshot.val()
            
            if (!data) {
                router.push('/lobbySelection')
                return
            }

            setLobby(data as LobbyInterface)
        })
        return () => unsubscribe()
    }, [gameUid, router])

    /**
     * useEffect #3: Game State Listener (MAIN GAME SYNC)
     * 
     * WHAT: Listens to the game state in Firebase - this is the SOURCE OF TRUTH
     * WHY: This is how all players stay synchronized:
     *      - When ANY player takes an action, the game state in Firebase updates
     *      - This listener receives the update and re-renders all players' screens
     *      - This is the "read" side of the Firebase sync
     * 
     * DEPENDENCIES: [gameUid]
     *      - gameUid: Re-subscribe if game ID changes
     * 
     * FLOW:
     *      1. Component mounts → listener subscribes to Firebase path: games/{gameUid}/gameState
     *      2. Game state changes (by ANY player) → callback fires → setGameState updates
     *      3. React re-renders with new game state → all players see the update
     *      4. Component unmounts → cleanup runs → listener removed
     * 
     * FIREBASE QUIRK: Firebase doesn't store empty arrays (they become null)
     *      - We must provide default empty arrays for: deck, hand, discard, inPlay, bases
     *      - Otherwise the game will crash when trying to map/filter these arrays
     * 
     * STATE UPDATES:
     *      - setGameState: Updates the entire game state (cards, players, turn, etc.)
     *      - setIsGameReady: Signals that game has been initialized and can render
     */
    useEffect(() => {
        const unsubscribe = onValue(ref(db, gameStatePath(gameUid)), (snapshot) => {
            const data = snapshot.val()
            if (data && data.order && data.order.length > 0) {
                // Firebase doesn't store empty arrays, so we need to provide defaults
                // Also need to ensure player arrays exist
                const playersWithDefaults: Record<string, PlayerState> = {}
                Object.keys(data.players || {}).forEach(playerId => {
                    const player = data.players[playerId]
                    playersWithDefaults[playerId] = {
                        ...player,
                        deck: player.deck || [],
                        hand: player.hand || [],
                        discard: player.discard || [],
                        inPlay: player.inPlay || [],
                        bases: player.bases || [],
                        factionTags: player.factionTags || {}
                    }
                })
                
                const gameStateWithDefaults = {
                    ...data,
                    players: playersWithDefaults,
                    scrap: data.scrap || [],
                    row: data.row || [],
                    tradeDeck: data.tradeDeck || [],
                    explorerDeck: data.explorerDeck || [],
                    log: data.log || [],
                    turn: {
                        ...data.turn,
                        playedThisTurn: data.turn?.playedThisTurn || []
                    }
                } as GameState
                setGameState(gameStateWithDefaults)
                setIsGameReady(true)
            }
        })
        return () => unsubscribe()
    }, [gameUid])

    /**
     * useEffect #4: Game Initialization (HOST ONLY)
     * 
     * WHAT: Initializes the game state in Firebase when the lobby is ready
     * WHY: Someone needs to create the initial game state (deal cards, set up decks)
     *      - Only the HOST does this to avoid duplicate initialization
     *      - Other players just wait for useEffect #3 to receive the state
     * 
     * DEPENDENCIES: [lobby, isGameReady, gameUid]
     *      - lobby: Need lobby data to know who the host is and get player UIDs
     *      - isGameReady: Prevents re-initialization if game already started
     *      - gameUid: Need this to write to the correct Firebase path
     * 
     * FLOW:
     *      1. Lobby loads (useEffect #2) → lobby state updates
     *      2. This effect runs → checks if we're the host
     *      3. If host AND game not ready → call initialSetup() → write to Firebase
     *      4. Firebase write triggers useEffect #3 for ALL players
     *      5. All players receive initial game state and render
     * 
     * GUARDS:
     *      - if (!lobby || isGameReady) return: Don't run if lobby not loaded or game already started
     *      - if (!currentUser) return: Don't run if not authenticated
     *      - if (lobby.hostUid === currentUser.uid): Only host initializes
     * 
     * NOTE: Uses player UIDs (not names) for game state
     *       - gameState.order = [uid1, uid2, ...]
     *       - gameState.players = { uid1: {...}, uid2: {...} }
     *       - Names are looked up from lobby data for display only
     */
    useEffect(() => {
        if (!lobby || isGameReady) return
        
        const currentUser = auth.currentUser
        if (!currentUser) return

        // Only host initializes the game
        if (lobby.hostUid === currentUser.uid) {
            // Use UIDs for order instead of names
            const playerUids = Object.keys(lobby.players)
            const initialGameState = initialSetup(playerUids)
            
            // Store player names in game state (so they persist even if lobby.players changes)
            const playerNames: Record<string, string> = {}
            playerUids.forEach(uid => {
                playerNames[uid] = lobby.players[uid]?.name || uid
            })
            initialGameState.playerNames = playerNames
            
            // Write to separate gameState path
            writeValue(gameStatePath(gameUid), initialGameState)
        }
    }, [lobby, isGameReady, gameUid])

    /**
     * useEffect #5: Turn Events Listener & Processor
     * 
     * WHAT: Listens to turn events and processes them to compute new game state
     * WHY: This is the "event processing engine" that makes the game interactive
     *      - Players write events (play card, buy card, etc.)
     *      - This listener receives events and computes the new game state
     *      - Updates the local React state for immediate UI feedback
     * 
     * DEPENDENCIES: [gameUid, isGameReady, gameState]
     *      - gameUid: Re-subscribe if game ID changes
     *      - isGameReady: Don't process events until game is initialized
     *      - gameState: Need the base state to apply events on top of
     * 
     * FLOW:
     *      1. Player takes action → writes Event to Firebase: games/{gameUid}/events
     *      2. This listener receives the events array
     *      3. Apply events on top of current gameState using replay()
     *      4. Update local React state → immediate UI feedback
     *      5. All other players receive same events → compute same state
     * 
     * EVENT PROCESSING (matches offline game pattern):
     *      - gameState: Base state (like "snapshot" in offline game)
     *      - turnEvents: Events that happened this turn
     *      - currentState = replay(gameState, turnEvents)
     *      - This computes the current state by applying events to base
     * 
     * WHY THIS DOESN'T CAUSE INFINITE LOOP:
     *      - We only update LOCAL state (setTurnEvents)
     *      - We DON'T write back to Firebase here
     *      - gameState only changes when someone writes to gameStatePath
     *      - Events are written by action handlers, not this effect
     * 
     * ARCHITECTURE:
     *      - gameState = "snapshot" (base state, updated less frequently)
     *      - turnEvents = events since last snapshot (updated frequently)
     *      - Displayed state = replay(gameState, turnEvents)
     *      - When turn ends, merge turnEvents into gameState, clear turnEvents
     */
    useEffect(() => {
        if (!isGameReady) return

        const unsubscribe = onValue(ref(db, eventPath(gameUid)), (snapshot) => {
            const data = snapshot.val()
            
            // If no events yet, initialize as empty array
            if (!data) {
                setTurnEvents([])
                return
            }

            // Firebase stores arrays as objects with numeric keys
            // Convert back to array if needed
            const eventsArray = Array.isArray(data) ? data : Object.values(data)
            
            // Filter out null/undefined values (Firebase quirk)
            const validEvents = eventsArray.filter(e => e != null)
            
            // Update local state with the events
            // The UI will use replay(gameState, turnEvents) to compute current state
            setTurnEvents(validEvents)   
            
        })

        return () => unsubscribe()
    }, [gameUid, isGameReady])
    
    // ============================================================================
    // RENDER GUARDS: Wait for all required data before rendering the game
    // ============================================================================
    if (!isGameReady || !currentUserId) {
        return (
            <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-cyan-300">Initializing Game...</h1>
                </div>
            </div>
        )
    }

    // ============================================================================
    // COMPUTE CURRENT STATE: Apply turn events on top of base game state
    // ============================================================================
    
    /**
     * currentState: The actual game state to display (base + events)
     * 
     * PATTERN (same as offline game):
     *      - gameState: Base "snapshot" state (updated less frequently)
     *      - turnEvents: Events that happened this turn (updated frequently)
     *      - currentState: Computed by applying events to base
     * 
     * WHY THIS PATTERN:
     *      - Writing full game state to Firebase is expensive (large data)
     *      - Writing small events is cheap (just the action)
     *      - Each client computes the same state from same events
     *      - When turn ends, merge events into base, clear events
     * 
     * EXAMPLE:
     *      - gameState: { player1: { hand: ['SCOUT', 'VIPER'], trade: 0 }, ... }
     *      - turnEvents: [{ t: 'CardPlayed', player: 'player1', handIndex: 0 }]
     *      - currentState: { player1: { hand: ['VIPER'], trade: 1 }, ... }
     * 
     * replay() applies each event to the state without expanding rules
     * This is fast and deterministic - all clients get the same result
     */
    const currentState = replay(gameState, turnEvents)

    // ============================================================================
    // DATA EXTRACTION: Get key player and game information
    // ============================================================================
    
    /**
     * currentPlayerId: The UID of the player whose turn it is (from currentState.order[activeIndex])
     * currentPlayer: The full player state of whose turn it is
     * 
     * IMPORTANT DISTINCTION:
     * - currentPlayerId = whose turn it is (changes each turn)
     * - currentUserId = the logged-in user (stays constant, set by useEffect #1)
     * 
     * NOTE: We use currentState (not gameState) because it includes turn events
     */
    const currentPlayerId = currentState.order[currentState.activeIndex]
    const currentPlayer = currentState.players[currentPlayerId]
    
    const { prompt: activePrompt } = getActivePrompt(turnEvents)
    
    // Safety check - ensure all required fields exist (arrays can be empty, just need to exist)
    if (!currentPlayer || !Array.isArray(currentState.scrap) || !Array.isArray(currentState.row) || !Array.isArray(currentState.tradeDeck)) {
        console.log('Missing data - Current Player:', !!currentPlayer, 'Scrap:', Array.isArray(currentState.scrap), 'Row:', Array.isArray(currentState.row), 'TradeDeck:', Array.isArray(currentState.tradeDeck))
        return (
            <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-cyan-300">Loading game data...</h1>
                    <p className="text-gray-400 mt-2">Check console for details</p>
                </div>
            </div>
        )
    }

    const getPlayerName = (uid: string) => {
        // Try game state first (persists even if player disconnects from lobby)
        const nameFromGame = currentState.playerNames?.[uid]
        if (nameFromGame) return nameFromGame
        
        // Fall back to lobby (for backwards compatibility with old games)
        const nameFromLobby = lobby?.players[uid]?.name
        if (nameFromLobby) return nameFromLobby
        
        // Last resort: return UID
        return uid
    }

    const currentStateWithNames = {
        ...currentState,
        players: Object.fromEntries(
            Object.entries(currentState.players).map(([uid, player]) => [
                uid,
                { ...player, id: getPlayerName(uid) }
            ])
        )
    }
    
    const myPlayer = currentStateWithNames.players[currentUserId]
    const isMyTurn = currentUserId === currentPlayerId

    /**
     * cleanUndefined: Remove undefined values from objects (Firebase doesn't allow them)
     * 
     * WHY: Some events have optional properties that can be undefined
     *      Example: PromptShown event has optional 'data' field
     *      Firebase rejects: { data: undefined }
     *      Firebase accepts: { } (property omitted)
     */
    const cleanUndefined = <T,>(obj: T): T => {
        if (Array.isArray(obj)) {
            return obj.map(cleanUndefined) as T
        }
        if (obj && typeof obj === 'object') {
            const cleaned: Record<string, unknown> = {}
            for (const key in obj) {
                if (obj[key] !== undefined) {
                    cleaned[key] = cleanUndefined(obj[key])
                }
            }
            return cleaned as T
        }
        return obj
    }

    const append = (rootEvent: Event | Event[]) => {
        const base = replay(gameState, turnEvents)
        
        // Ensure turn.playedThisTurn exists (Firebase quirk: empty arrays become null)
        if (!base.turn.playedThisTurn) {
            base.turn.playedThisTurn = []
        }
        
        const roots = Array.isArray(rootEvent) ? rootEvent : [rootEvent]
        const { events: expandedEvents } = materialize(base, roots)
        
        // Clean undefined values before writing to Firebase
        const cleanedEvents = cleanUndefined([...turnEvents, ...expandedEvents])
        
        writeValue(eventPath(gameUid), cleanedEvents)
    }
    
    const handleSelectTradeCard = (card: CardDef, source: 'row' | 'explorer', index: number) => {
        if (!isMyTurn) return

        // Check if player can afford the card
        const canAfford = currentPlayer.trade >= card.cost || currentPlayer.freeNextAcquire
        if (!canAfford) {
            setErrorMessage(`Not enough trade! Need ${card.cost} 🟡, you have ${currentPlayer.trade} 🟡`)
            setTimeout(() => setErrorMessage(null), 2000) // Auto-dismiss after 3 seconds
            return
        }

        append([
            { t: 'CardPurchased', player: currentPlayerId, card: card.id, source: source, rowIndex: index },
            { t: 'TradeSpent', player: currentPlayerId, card: card.id, amount: card.cost }
        ])
        // Close the overlay when buying a card
        forceCloseCardDetail()
    }

    const handlePlayCard = (card: CardDef, cardIndex: number) => {
        if (!isMyTurn) return // Guard: only on your turn
        
        if (card.type === 'ship') {
            append({ 
                t: 'CardPlayed', 
                player: currentPlayerId, 
                handIndex: cardIndex 
            })
        } else if (card.type === 'base') {
            append({ 
                t: 'BasePlayed', 
                player: currentPlayerId, 
                card: card.id, 
                handIndex: cardIndex 
            })
        }
    }

    const handleActivateBase = (baseIndex: number) => {
        if (!isMyTurn) return
        append({
            t: 'BaseActivated',
            player: currentPlayerId,
            baseIndex
        })
    }

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
            { t: "TradeSpent", player: currentPlayerId, card: card, amount: cardRegistry[card].cost }
        ])
    }

    const handleScrapBase = (baseIndex: number) => {
        if (!isMyTurn) return
        const base = currentPlayer.bases[baseIndex]
        append({
            t: 'CardScrapped',
            player: currentPlayerId,
            from: 'bases',
            placementIndex: baseIndex,
            card: base.id
        })
    }

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
        if (!isMyTurn) return // Guard: only on your turn
        
        // Step 1: Merge all turn events into the base state
        const base = replay(gameState, turnEvents)
        
        // Ensure required fields exist (Firebase quirks)
        if (!base.turn.playedThisTurn) {
            base.turn.playedThisTurn = []
        }
        
        // Step 2: Apply the end turn event (triggers cleanup, draw, advance turn)
        const { state: endState } = materialize(base, [
            { t: 'PhaseChanged', from: 'MAIN', to: 'CLEANUP' }
        ])
        
        // Step 3: Write the new base state to Firebase
        writeValue(gameStatePath(gameUid), endState)
        
        // Step 4: Clear the events for the next turn
        writeValue(eventPath(gameUid), [])
    }

    // Card detail handlers
    const showCardDetail = (card: CardDef, mode: 'hover' | 'click', onActivateBase?: () => void, baseAlreadyActivated?: boolean, onScrapBase?: () => void, buttonMode?: 'activate' | 'attack') => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        setCardDetailState({ card, isOpen: true, mode, onActivateBase, baseAlreadyActivated, onScrapBase, buttonMode })
    }

    const hideCardDetail = () => {
        if (cardDetailState.mode === 'click') return
        
        hoverTimeoutRef.current = setTimeout(() => {
            setCardDetailState({ card: null, isOpen: false, mode: 'hover' })
        }, 100)
    }

    const forceCloseCardDetail = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        setCardDetailState({ card: null, isOpen: false, mode: 'hover' })
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-2.5 h-full">
                
                <TradeRowSection 
                    tradeDeck={currentState.tradeDeck}
                    tradeRow={currentState.row}
                    explorerDeck={currentState.explorerDeck}
                    scrapPileCount={currentState.scrap.length}
                    onSelectCard={handleSelectTradeCard}
                    onCardHover={showCardDetail}
                    onCardLeave={hideCardDetail}
                    onCardClick={showCardDetail}
                    onViewTradeDeck={handleViewTradeDeck}
                />

                <PlayerSummaryBar 
                    players={currentStateWithNames.players}
                    playerOrder={currentState.order}
                    currentPlayerId={currentUserId}
                    append={append}
                />

                <OpponentBasesViewer 
                    players={currentStateWithNames.players}
                    playerOrder={currentState.order}
                    currentPlayerId={currentUserId}
                    append={append}
                    onCardHover={(card, mode, onAttack) => showCardDetail(card, mode, onAttack, false, undefined, 'attack')}
                    onCardLeave={hideCardDetail}
                />

                <CurrentPlayerBases 
                    bases={myPlayer.bases}
                    playerId={getPlayerName(currentUserId)}
                    onActivateBase={isMyTurn ? handleActivateBase : undefined}
                    onScrapBase={isMyTurn ? handleScrapBase : undefined}
                    onCardHover={showCardDetail}
                    onCardLeave={hideCardDetail}
                />

                <PlayerHand 
                    player={myPlayer}
                    onPlayCard={isMyTurn ? handlePlayCard : undefined}
                    onScrapCard={isMyTurn ? (() => {}) : undefined}
                    onViewDiscard={handleViewDiscard}
                    onViewDeck={handleViewDeck}
                    onViewScrap={handleViewScrap}
                    onEndTurn={isMyTurn ? handleEndTurn : undefined}
                    onCardClick={showCardDetail}
                    scrapPileCount={currentState.scrap.length}
                />

            </div>

            {/* OVERLAYS - Wire these up to show based on activePrompt */}
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapRow' && isMyTurn && (
                <ScrapPromptOverlay 
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    handleFunction={handleScrapTradeRow}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseRowForFree' && isMyTurn && (
                <ScrapPromptOverlay 
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    handleFunction={handleFreeCard}
                />
            )}
            
            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'opponentDiscard' && isMyTurn && (
                <OpponentDiscardOverlay
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={currentState.order[currentState.activeIndex]}
                    getPlayerName={getPlayerName}
                />
            )}

            {activePrompt?.t === 'PromptShown' && (activePrompt.kind === 'opponentChoice' || activePrompt.kind === 'choosePlayer') && isMyTurn && (
                <OpponentChoiceOverlay
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={currentState.order[currentState.activeIndex]}
                    getPlayerName={getPlayerName}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'scrapSelf' && isMyTurn && (
                <ChooseToScrapOverlay
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={currentState.order[currentState.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseOtherCardToScrap' && isMyTurn && (
                <ChooseOtherCardToScrapOverlay
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={currentState.order[currentState.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseAbility' && isMyTurn && (
                <ChooseAbilityOverlay
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={currentState.order[currentState.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && (activePrompt.kind === 'copyShip' || activePrompt.kind === 'chooseInPlayShip') && isMyTurn && (
                <ChooseCardToCopyOverlay
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={currentState.order[currentState.activeIndex]}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'chooseOpponentBase' && isMyTurn && (
                <ChooseOpponentBaseOverlay
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={currentState.order[currentState.activeIndex]}
                    getPlayerName={getPlayerName}
                />
            )}

            {activePrompt?.t === 'PromptShown' && activePrompt.kind === 'discardOrScrapAndDraw' && isMyTurn && (
                <DiscardAndDrawOverlay
                    state={currentState}
                    activePrompt={activePrompt}
                    append={append}
                    currentPlayer={currentState.order[currentState.activeIndex]}
                />
            )}

            {/* Card Detail Overlay */}
            <CardDetailOverlay
                card={cardDetailState.card}
                isOpen={cardDetailState.isOpen}
                onClose={forceCloseCardDetail}
                mode={cardDetailState.mode}
                onMouseEnter={() => {
                    if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current)
                        hoverTimeoutRef.current = null
                    }
                }}
                onMouseLeave={hideCardDetail}
                onActivateBase={cardDetailState.onActivateBase}
                showActivateButton={!!cardDetailState.onActivateBase}
                baseAlreadyActivated={cardDetailState.baseAlreadyActivated}
                onScrapBase={cardDetailState.onScrapBase}
                showScrapButton={!!cardDetailState.onScrapBase}
                buttonMode={cardDetailState.buttonMode}
            />
            {
                showDiscardDeck &&
                <DiscardDeckOverlay
                    currentPlayer={myPlayer}
                    onClose={closeViewDiscard}
                />
            }
            {
                showDeck &&
                <DeckOverlay
                    currentPlayer={myPlayer}
                    onClose={closeViewDeck}
                />
            }
            {
                showScrap &&
                <ScrapOverlay
                    scrappedCards={currentState.scrap}
                    onClose={closeViewScrap}
                />
            }
            {
                showTradeDeck &&
                <TradeRowDeckOverlay
                    tradeDeck={currentState.tradeDeck}
                    onClose={closeViewTradeDeck}
                />
            }

            {/* Error Notification Overlay */}
            {errorMessage && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-gradient-to-r from-red-600 to-red-500 border-3 border-red-400 rounded-xl shadow-2xl shadow-red-500/50 px-6 py-4 max-w-md">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-white font-bold text-lg">Cannot Purchase</p>
                                <p className="text-red-100 text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <GameOverOverlay
                state={currentStateWithNames}
                onNewGame={() => {
                    // For online games, redirect to lobby selection
                    router.push('/lobbySelection')
                }}
            />
        </div>
    )
}