import { create } from 'zustand';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

let toastId = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  add: (toast) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), toast.duration || 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (msg) => useToastStore.getState().add({ type: 'success', message: msg }),
  error:   (msg) => useToastStore.getState().add({ type: 'error',   message: msg }),
  info:    (msg) => useToastStore.getState().add({ type: 'info',    message: msg }),
};

const icons = {
  success: <CheckCircle size={16} className="text-green-500" />,
  error:   <XCircle     size={16} className="text-red-500" />,
  info:    <AlertCircle size={16} className="text-blue-500" />,
};

const styles = {
  success: 'border-l-4 border-green-500',
  error:   'border-l-4 border-red-500',
  info:    'border-l-4 border-blue-500',
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div key={t.id} className={`bg-white shadow-lg rounded-xl p-4 flex items-start gap-3 ${styles[t.type]}`}>
          <span className="mt-0.5">{icons[t.type]}</span>
          <p className="text-sm text-gray-700 flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
