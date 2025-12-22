import { CombatNotification } from "@/app/engine/state";
import { useState, useEffect } from "react";

interface CombatNotificationOverlayProps {
    notifications: CombatNotification[];
    playerNames: Record<string, string>;
    onClose: () => void;
}

export default function CombatNotificationOverlay({ notifications, playerNames, onClose }: CombatNotificationOverlayProps) {
    const [showModal, setShowModal] = useState(false);
    const [currentToastIndex, setCurrentToastIndex] = useState(0);
    const [showToast, setShowToast] = useState(true);

    // Cycle through toasts automatically
    useEffect(() => {
        if (notifications.length === 0) return;

        const timer = setTimeout(() => {
            if (currentToastIndex < notifications.length - 1) {
                setCurrentToastIndex(prev => prev + 1);
            } else {
                setShowToast(false); // Hide toast after showing all
            }
        }, 3000); // Show each toast for 3 seconds

        return () => clearTimeout(timer);
    }, [currentToastIndex, notifications.length]);

    if (notifications.length === 0) return null;

    const formatMessage = (notification: CombatNotification): string => {
        const attackerName = playerNames[notification.attacker] || notification.attacker;
        
        if (notification.targetType === 'player') {
            return `${attackerName} attacked you for ${notification.amount} damage`;
        }
        
        if (notification.baseDestroyed) {
            return `${attackerName} destroyed ${notification.baseName} by attacking with ${notification.amount} damage`;
        }
        
        return `${attackerName} attacked your ${notification.baseName} for ${notification.amount} damage`;
    };

    const currentNotification = notifications[currentToastIndex];

    return (
        <>
            {/* Toast Notification at Top */}
            {showToast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`px-6 py-3 rounded-lg border-2 shadow-xl ${
                        currentNotification.baseDestroyed 
                            ? 'bg-red-900/95 border-red-500' 
                            : 'bg-orange-900/95 border-orange-500'
                    }`}>
                        <p className="text-gray-100 font-semibold text-center">
                            ⚔️ {formatMessage(currentNotification)}
                        </p>
                        {notifications.length > 1 && (
                            <p className="text-gray-400 text-xs text-center mt-1">
                                {currentToastIndex + 1} / {notifications.length}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Button to Open Full Report */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl border-2 border-red-400 transition-all flex items-center gap-2"
                >
                    ⚔️ Combat Report ({notifications.length})
                </button>
            </div>

            {/* Full Modal (when button clicked) */}
            {showModal && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={() => setShowModal(false)}
                    />
                    
                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <div className="pointer-events-auto bg-slate-800 border-3 border-red-500 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-red-500/30">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                                    ⚔️ Combat Report
                                </h2>
                            </div>
                            
                            {/* Notifications List */}
                            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                                {notifications.map((notification, index) => (
                                    <div 
                                        key={notification.id || index}
                                        className={`p-3 rounded-lg border-2 ${
                                            notification.baseDestroyed 
                                                ? 'bg-red-900/40 border-red-500' 
                                                : 'bg-orange-900/40 border-orange-500'
                                        }`}
                                    >
                                        <p className="text-gray-100 text-sm">
                                            {formatMessage(notification)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Close Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        onClose();
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                                >
                                    Acknowledge All
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
