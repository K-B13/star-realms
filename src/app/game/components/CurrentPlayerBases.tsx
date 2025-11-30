import { BaseInstance } from "@/app/engine/state";

interface CurrentPlayerBasesProps {
    bases: BaseInstance[];
    playerId: string;
    onActivateBase?: (baseIndex: number) => void;
}

export default function CurrentPlayerBases({ bases, playerId, onActivateBase }: CurrentPlayerBasesProps) {
    return (
        <div className="border-3 border-cyan-500 rounded-xl bg-slate-800 p-3 shadow-lg shadow-cyan-500/20 h-40">
            <p className="text-base font-bold text-cyan-300 mb-2 text-center">{playerId} Bases (You)</p>
            <div className="flex gap-3 justify-center flex-wrap items-center h-28">
                {bases.length === 0 ? (
                    <p className="text-gray-400 text-sm">No bases</p>
                ) : (
                    bases.map((base, index) => (
                        <div 
                            key={index} 
                            className="border-2 border-blue-400 rounded-lg bg-slate-600 p-3 w-40 shadow-md shadow-blue-400/20 cursor-pointer hover:bg-slate-500 transition-colors"
                            onClick={() => onActivateBase?.(index)}
                        >
                            <p className="text-center text-sm font-bold text-gray-100 mb-1">{base.id}</p>
                            <p className="text-center text-xs text-gray-200">
                                Shield: {base.defence} {base.shield === 'outpost' ? '⚫' : '⚪'}
                            </p>
                            {base.activatedThisTurn && (
                                <p className="text-center text-xs text-green-400 mt-1">✓ Activated</p>
                            )}
                            {/* Damage bar (red) */}
                            <div className="mt-1.5 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-red-500 h-full rounded-full transition-all"
                                    style={{ width: `${(base.damage / base.defence) * 100}%` }}
                                ></div>
                            </div>
                            {/* Shield bar (gray background) */}
                            <div className="mt-1 bg-gray-700 h-2.5 rounded-full"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
