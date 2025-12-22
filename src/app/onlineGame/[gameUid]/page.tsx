'use client'
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
import LogOverlay from "@/app/game/components/LogOverlay"
import CombatNotificationOverlay from "@/app/game/components/CombatNotificationOverlay"

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
        combatLog: [],
        currentTurnNotifications: {}
    })
    const [lobby, setLobby] = useState<LobbyInterface | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [isGameReady, setIsGameReady] = useState(false)
    const [turnEvents, setTurnEvents] = useState<Event[]>([])
    const params = useParams()
    const router = useRouter()
    const gameUid = params.gameUid as string

    const [showDeck, setShowDeck] = useState(false)
    const [showScrap, setShowScrap] = useState(false)
    const [showTradeDeck, setShowTradeDeck] = useState(false)
    const [showDiscardDeck, setShowDiscardDeck] = useState(false)
    const [showLog, setShowLog] = useState(false)
    
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
            if (data && data.order && data.order.length > 0) {
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
                    },
                    combatLog: data.combatLog || [],
                    currentTurnNotifications: data.currentTurnNotifications || {}
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

        if (lobby.hostUid === currentUser.uid) {
            const playerUids = Object.keys(lobby.players)
            const initialGameState = initialSetup(playerUids)
            
            const playerNames: Record<string, string> = {}
            playerUids.forEach(uid => {
                playerNames[uid] = lobby.players[uid]?.name || uid
            })
            initialGameState.playerNames = playerNames
            
            writeValue(gameStatePath(gameUid), initialGameState)
        }
    }, [lobby, isGameReady, gameUid])

    useEffect(() => {
        if (!isGameReady) return

        const unsubscribe = onValue(ref(db, eventPath(gameUid)), (snapshot) => {
            const data = snapshot.val()
            
            if (!data) {
                setTurnEvents([])
                return
            }

            const eventsArray = Array.isArray(data) ? data : Object.values(data)
            
            const validEvents = eventsArray.filter(e => e != null)
            
            setTurnEvents(validEvents)   
            
        })

        return () => unsubscribe()
    }, [gameUid, isGameReady])
 
    if (!isGameReady || !currentUserId) {
        return (
            <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-cyan-300">Initializing Game...</h1>
                </div>
            </div>
        )
    }

    const currentState = replay(gameState, turnEvents)

    const currentPlayerId = currentState.order[currentState.activeIndex]
    const currentPlayer = currentState.players[currentPlayerId]
    
    const { prompt: activePrompt } = getActivePrompt(turnEvents)
    
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
        const nameFromGame = currentState.playerNames?.[uid]
        if (nameFromGame) return nameFromGame
        
        const nameFromLobby = lobby?.players[uid]?.name
        if (nameFromLobby) return nameFromLobby
        
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
        
        if (!base.turn.playedThisTurn) {
            base.turn.playedThisTurn = []
        }
        
        const roots = Array.isArray(rootEvent) ? rootEvent : [rootEvent]
        const { events: expandedEvents } = materialize(base, roots)
        
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
        
        const base = replay(gameState, turnEvents)
        
        if (!base.turn.playedThisTurn) {
            base.turn.playedThisTurn = []
        }
        
        const { state: endState } = materialize(base, [
            { t: 'PhaseChanged', from: 'MAIN', to: 'CLEANUP' }
        ])
        
        writeValue(gameStatePath(gameUid), endState)
        
        writeValue(eventPath(gameUid), [])
    }

    const handleClearCombatNotifications = () => {
        const updatedNotifications = { ...currentState.currentTurnNotifications }
        delete updatedNotifications[currentUserId]
        
        const updatedState = {
            ...currentState,
            currentTurnNotifications: updatedNotifications
        }
        writeValue(gameStatePath(gameUid), updatedState)
        
        writeValue(eventPath(gameUid), [])
    }

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="mx-auto flex flex-col gap-2.5">
                
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
                    activeIndex={currentState.activeIndex}
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
                    currentPlayerId={currentUserId}
                    turnPlayerId={currentState.order[currentState.activeIndex]}
                    onPlayCard={isMyTurn ? handlePlayCard : undefined}
                    onScrapCard={isMyTurn ? (() => {}) : undefined}
                    onViewDiscard={handleViewDiscard}
                    onViewDeck={handleViewDeck}
                    onViewScrap={handleViewScrap}
                    onEndTurn={isMyTurn ? handleEndTurn : undefined}
                    onCardClick={showCardDetail}
                    onToggleLog={() => setShowLog(!showLog)}
                    scrapPileCount={currentState.scrap.length}
                />
            </div>

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
            
            {/* Combat Notification Overlay */}
            {currentState.currentTurnNotifications[currentUserId] && currentState.currentTurnNotifications[currentUserId].length > 0 && (
                <CombatNotificationOverlay
                    notifications={currentState.currentTurnNotifications[currentUserId]}
                    playerNames={Object.fromEntries(
                        currentState.order.map(uid => [uid, getPlayerName(uid)])
                    )}
                    onClose={handleClearCombatNotifications}
                />
            )}

            {/* Game Log */}
            {showLog && (
                <LogOverlay
                    log={currentState.log}
                    players={currentState.order}
                    currentPlayerId={currentUserId}
                    playerNames={Object.fromEntries(currentState.order.map(uid => [uid, getPlayerName(uid)]))}
                    onClose={() => setShowLog(false)}
                />
            )}
        </div>
    )
}