'use client'
import { useState, useEffect, useRef } from "react"
import { onValue, ref } from "firebase/database"
import { useParams, useRouter } from "next/navigation"
import { db, auth } from "../../firebase/firebaseConfig"
import { lobbyPath, gameStatePath } from "@/app/firebase/firebasePaths"
import { GameState, PlayerState } from "../../engine/state"
import { LobbyInterface } from "../../lobbyCreation/page"
import { initialSetup } from "../../engine/initialSetup"
import { writeValue } from "../../firebase/firebaseActions"
import { CardDef } from "../../engine/cards"

// Import components from offline game
import TradeRowSection from "../../game/components/TradeRowSection"
import PlayerSummaryBar from "../../game/components/PlayerSummaryBar"
import OpponentBasesViewer from "../../game/components/OpponentBasesViewer"
import CurrentPlayerBases from "../../game/components/CurrentPlayerBases"
import PlayerHand from "../../game/components/PlayerHand"
import CardDetailOverlay from "../../game/components/CardDetailOverlay"

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
    const params = useParams()
    const router = useRouter()
    const gameUid = params.gameUid as string

    // UI state (same as offline game)
    const [showDiscardDeck, setShowDiscardDeck] = useState(false)
    const [showDeck, setShowDeck] = useState(false)
    const [showScrap, setShowScrap] = useState(false)
    const [showTradeDeck, setShowTradeDeck] = useState(false)
    
    // Card detail overlay state
    const [cardDetailState, setCardDetailState] = useState<{
        card: CardDef | null;
        isOpen: boolean;
        mode: 'hover' | 'click';
        onActivateBase?: () => void;
        baseAlreadyActivated?: boolean;
        onScrapBase?: () => void;
    }>({ card: null, isOpen: false, mode: 'hover' })
    
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Get current user ID
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUserId(user.uid)
            }
        })
        return () => unsubscribe()
    }, [])

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

    useEffect(() => {
        const unsubscribe = onValue(ref(db, gameStatePath(gameUid)), (snapshot) => {
            const data = snapshot.val()
            console.log('Game state from Firebase:', data)
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
                        bases: player.bases || []
                    }
                })
                
                const gameStateWithDefaults = {
                    ...data,
                    players: playersWithDefaults,
                    scrap: data.scrap || [],
                    row: data.row || [],
                    tradeDeck: data.tradeDeck || [],
                    explorerDeck: data.explorerDeck || [],
                    log: data.log || []
                } as GameState
                setGameState(gameStateWithDefaults)
                setIsGameReady(true)
            }
        })
        return () => unsubscribe()
    }, [gameUid])

    useEffect(() => {
        if (!lobby || isGameReady) return
        
        const currentUser = auth.currentUser
        if (!currentUser) return

        // Only host initializes the game
        if (lobby.hostUid === currentUser.uid) {
            // Use UIDs for order instead of names
            const playerUids = Object.keys(lobby.players)
            const initialGameState = initialSetup(playerUids)
            
            // Write to separate gameState path
            writeValue(gameStatePath(gameUid), initialGameState)
        }
    }, [lobby, isGameReady, gameUid])

    if (!isGameReady || !currentUserId) {
        return (
            <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-cyan-300">Initializing Game...</h1>
                </div>
            </div>
        )
    }

    // Get current player - the player ID in gameState.order is the UID
    const currentPlayerId = gameState.order[gameState.activeIndex]
    const currentPlayer = gameState.players[currentPlayerId]
    
    // Safety check - ensure all required fields exist (arrays can be empty, just need to exist)
    if (!currentPlayer || !Array.isArray(gameState.scrap) || !Array.isArray(gameState.row) || !Array.isArray(gameState.tradeDeck)) {
        console.log('Missing data - Current Player:', !!currentPlayer, 'Scrap:', Array.isArray(gameState.scrap), 'Row:', Array.isArray(gameState.row), 'TradeDeck:', Array.isArray(gameState.tradeDeck))
        return (
            <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-cyan-300">Loading game data...</h1>
                    <p className="text-gray-400 mt-2">Check console for details</p>
                </div>
            </div>
        )
    }
    
    // Helper function to get player name from UID
    const getPlayerName = (uid: string) => {
        return lobby?.players[uid]?.name || uid
    }
    
    // Create a modified game state with player names for display
    const gameStateWithNames = {
        ...gameState,
        players: Object.fromEntries(
            Object.entries(gameState.players).map(([uid, player]) => [
                uid,
                { ...player, id: getPlayerName(uid) }
            ])
        )
    }
    
    // Get the LOGGED IN user's player data (not the active turn player)
    const myPlayer = gameStateWithNames.players[currentUserId]
    const isMyTurn = currentUserId === currentPlayerId
    
    // Debug logging
    // console.log('Current User ID:', currentUserId)
    // console.log('Current Player ID (active turn):', currentPlayerId)
    // console.log('Is My Turn:', isMyTurn)
    // console.log('My Player:', myPlayer)
    // console.log('Lobby Players:', lobby?.players)
    // console.log('Game State Players (original):', gameState.players)
    // console.log('Game State With Names:', gameStateWithNames.players)
    // console.log('Player Order:', gameState.order)
    
    /* 
     * FIREBASE CONNECTIONS YOU NEED TO IMPLEMENT:
     * 
     * 1. EVENT SYSTEM: You need to create a Firebase path for events
     *    - Path: `games/${gameUid}/events` (array of events)
     *    - When a player takes an action, push an event to this array
     *    - All players listen to this events array
     * 
     * 2. EVENT PROCESSING: 
     *    - Listen to the events array with onValue()
     *    - When new events arrive, use materialize() to expand them (like offline game)
     *    - Update the gameState in Firebase with the new computed state
     * 
     * 3. TURN MANAGEMENT:
     *    - Only the current player (currentUserId === currentPlayerId) should be able to write events
     *    - You can add validation in the handlers below
     * 
     * 4. SNAPSHOT SYSTEM (optional but recommended):
     *    - Store a snapshot at games/${gameUid}/snapshot
     *    - Store turn events at games/${gameUid}/turnEvents
     *    - When turn ends, merge turnEvents into snapshot and clear turnEvents
     *    - This matches the offline game's snapshot + turnEvents pattern
     */
    
    // Placeholder handlers - YOU will implement these with Firebase writes
    const handleSelectTradeCard = (card: CardDef, source: 'row' | 'explorer', index: number) => {
        // TODO: Write event to Firebase
        console.log('Buy card:', card.id, source, index)
    }

    const handlePlayCard = (card: CardDef, cardIndex: number) => {
        // TODO: Write event to Firebase
        console.log('Play card:', card.id, cardIndex)
    }

    const handleActivateBase = (baseIndex: number) => {
        // TODO: Write event to Firebase
        console.log('Activate base:', baseIndex)
    }

    const handleScrapBase = (baseIndex: number) => {
        // TODO: Write event to Firebase
        console.log('Scrap base:', baseIndex)
    }

    const handleEndTurn = () => {
        // TODO: Write phase change event to Firebase
        console.log('End turn')
    }

    // Card detail handlers
    const showCardDetail = (card: CardDef, mode: 'hover' | 'click', onActivateBase?: () => void, baseAlreadyActivated?: boolean, onScrapBase?: () => void) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        setCardDetailState({ card, isOpen: true, mode, onActivateBase, baseAlreadyActivated, onScrapBase })
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
                    tradeDeck={gameState.tradeDeck}
                    tradeRow={gameState.row}
                    explorerDeck={gameState.explorerDeck}
                    scrapPileCount={gameState.scrap.length}
                    onSelectCard={handleSelectTradeCard}
                    onCardHover={showCardDetail}
                    onCardLeave={hideCardDetail}
                    onCardClick={showCardDetail}
                    onViewTradeDeck={() => setShowTradeDeck(true)}
                />

                <PlayerSummaryBar 
                    players={gameStateWithNames.players}
                    playerOrder={gameState.order}
                    currentPlayerId={currentUserId}
                    append={() => {}} // TODO: You'll implement this
                />

                <OpponentBasesViewer 
                    players={gameStateWithNames.players}
                    playerOrder={gameState.order}
                    currentPlayerId={currentUserId}
                    append={() => {}} // TODO: You'll implement this
                />

                <CurrentPlayerBases 
                    bases={myPlayer.bases}
                    playerId={getPlayerName(currentUserId)}
                    onActivateBase={isMyTurn ? handleActivateBase : () => {}}
                    onScrapBase={isMyTurn ? handleScrapBase : () => {}}
                    onCardHover={showCardDetail}
                    onCardLeave={hideCardDetail}
                />

                <PlayerHand 
                    player={myPlayer}
                    onPlayCard={isMyTurn ? handlePlayCard : () => {}}
                    onScrapCard={isMyTurn ? (() => {}) : () => {}} // TODO: You'll implement this
                    onViewDiscard={() => setShowDiscardDeck(true)}
                    onViewDeck={() => setShowDeck(true)}
                    onViewScrap={() => setShowScrap(true)}
                    onEndTurn={isMyTurn ? handleEndTurn : () => {}}
                    onCardClick={showCardDetail}
                    scrapPileCount={gameState.scrap.length}
                />

            </div>

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
            />
        </div>
    )
}