import { useState, useEffect, createContext, useContext, useCallback } from "react";

// Toast Context
const ToastContext = createContext();

// Toast types config
const toastConfig = {
    success: {
        bg: "bg-green-500",
        icon: "✅"
    },
    error: {
        bg: "bg-red-500",
        icon: "❌"
    },
    info: {
        bg: "bg-blue-500",
        icon: "ℹ️"
    },
    warning: {
        bg: "bg-orange-500",
        icon: "⚠️"
    }
};

// Individual Toast Component
const ToastItem = ({ toast, onRemove }) => {
    const config = toastConfig[toast.type] || toastConfig.info;

    useEffect(() => {
        // Auto remove after duration
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div className={`
      ${config.bg} text-white px-5 py-3 rounded-xl shadow-lg
      flex items-center gap-3 min-w-[280px] max-w-[380px]
      animate-slide-in
    `}>
            <span className="text-lg flex-shrink-0">{config.icon}</span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-white opacity-70 hover:opacity-100 flex-shrink-0 ml-2"
            >
                ✕
            </button>
        </div>
    );
};

// Toast Provider — wraps the whole app
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* Toast Container — fixed bottom right */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// Custom hook to use toast anywhere
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }
    return context.addToast;
};