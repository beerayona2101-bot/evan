import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const newToast: ToastMessage = {
    id: `${Date.now()}-${Math.random()}`,
    type,
    message,
  };
  toastListeners.forEach((listener) => listener(newToast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleNewToast = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    toastListeners.push(handleNewToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handleNewToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-slate-950/90 text-amber-300 border-amber-400/60'
              : toast.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-500/60'
              : 'bg-slate-900/90 text-slate-100 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span className="text-xs font-bold tracking-wide">{toast.message}</span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:opacity-70 text-slate-400 hover:text-white transition-opacity ml-3"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
