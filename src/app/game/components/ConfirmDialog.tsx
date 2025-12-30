interface ConfirmDialogProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <p className="text-slate-200 text-lg mb-6 whitespace-pre-line">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        Yes
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
}
