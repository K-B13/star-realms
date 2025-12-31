import { Event } from "@/app/engine/events";
import { LogEntry } from "@/app/engine/state";
import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";

interface LogOverlayProps {
    log: LogEntry[];
    players: string[];
    currentPlayerId: string;
    onClose?: () => void;
    playerNames?: Record<string, string>;
    append: (event: Event | Event[]) => void;
}

export default function LogOverlay({ log, players, currentPlayerId, onClose, playerNames, append }: LogOverlayProps) {
    const [ isMinimized, setIsMinimized ] = useState(false);
    const [ selectedPlayer, setSelectedPlayer ] = useState<string>("all");
    const dragNodeRef = useRef(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [ showOnlyChat, setShowOnlyChat ] = useState(true);

    const filteredLogs = showOnlyChat ? log.filter(entry => {
        if (entry.type !== 'chat') return false;
        return !entry.to || entry.from === currentPlayerId || entry.to === currentPlayerId;
    }) : 
        log.filter(entry => {
            return !entry.to || entry.to === currentPlayerId || entry.from === currentPlayerId
        });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [filteredLogs]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowOnlyChat(e.target.checked);
    };

    const handlePlayerNames = (log: LogEntry) => {
        const updatedLog = log.content.split(' ').map(word => {
            if (!players.includes(word)) {
                return word;
            }
            return playerNames?.[word];
        }).join(' ')
        return updatedLog
    }

    // Reset selected player when component mounts or when currentPlayerId changes
    useEffect(() => {
        setSelectedPlayer('all');
    }, [currentPlayerId]);

    const handleSubmitMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return
        e.preventDefault()

        const message = e.currentTarget.value
        e.currentTarget.value = ''
        // Reset selected player to 'all' after sending a message
        setSelectedPlayer('all')

        if (selectedPlayer === 'all') {
            append({ t: 'Chat', type: 'chat', from: currentPlayerId, content: message, timestamp: Date.now() })
        } else {
            append({ t: 'Chat', type: 'chat', from: currentPlayerId, to: selectedPlayer, content: message, timestamp: Date.now() })
        }
    }

    return (
        <div className="fixed right-4 top-20 w-full max-w-2xl z-40">
            <Draggable handle=".drag-handle" nodeRef={dragNodeRef}>
                <div ref={dragNodeRef} className="bg-slate-800/95 border-2 border-slate-600 rounded-xl shadow-2xl pointer-events-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-600 drag-handle cursor-move">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-slate-200">Game Log</h2>
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={showOnlyChat} 
                                    onChange={handleFilterChange}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                                />
                                Chat Only
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                {isMinimized ? "Maximize" : "Minimize"}
                            </button>
                            {onClose && (
                                <button 
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <>
                            {/* Log Messages */}
                            <div ref={scrollRef} className="h-64 overflow-y-auto p-4 space-y-2">
                                {filteredLogs.map((entry, index) => (
                                    <div 
                                        key={index}
                                        className={`text-sm ${entry.type === 'chat' 
                                            ? entry.to 
                                                ? 'text-purple-300'
                                                : 'text-cyan-300'  
                                            : 'text-slate-300'    
                                        }`}
                                    >
                                        <span className="text-slate-500 mr-2">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>
                                        {entry.type === 'chat' ? (
                                            <>
                                                <span className="font-semibold mr-1">[{entry.from === currentPlayerId ? 'You' : (playerNames?.[entry.from || ''] || entry.from)}]</span>
                                                {entry.to && (
                                                    <span className="text-slate-400 mr-1">(to {entry.to === currentPlayerId ? "You" : (playerNames?.[entry.to] || entry.to)})</span>
                                                )}
                                                {entry.content}
                                            </>
                                        ) : (
                                            playerNames 
                                                ? handlePlayerNames(entry)
                                                : entry.content
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-slate-600 flex gap-2">
                                <select 
                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                    className="bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm border border-slate-600"
                                >
                                    <option value="all">All Players</option>
                                    {players
                                        .filter(id => {
                                            return id !== currentPlayerId
                                        })
                                        .map(playerId => {
                                            const displayNames = playerNames ? playerNames[playerId] : playerId
                                            return (
                                                <option key={playerId} value={playerId}>{displayNames}</option>
                                            )
                                        })
                                    }
                                </select>
                                <input
                                    type="text"
                                    onKeyDown={handleSubmitMessage}
                                    placeholder={`Message ${selectedPlayer === 'all' ? 'everyone' : selectedPlayer}...`}
                                    className="flex-1 bg-slate-700 text-slate-200 rounded px-3 py-1 text-sm border border-slate-600 placeholder:text-slate-400"
                                />
                            </div>
                        </>
                    )}
                </div>
            </Draggable>
        </div>
    );
}
