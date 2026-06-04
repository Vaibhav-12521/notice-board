import { useEffect } from "react";

const STYLES = {
  success: "bg-stone-900",
  error: "bg-red-600",
  info: "bg-stone-900",
};

/**
 * Small auto-dismissing toast pinned to the bottom-right.
 *
 * @param {{type?: "success"|"error"|"info", message: string, onClose: () => void}} props
 */
export default function Toast({ type = "info", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <div
        role="status"
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
          STYLES[type] || STYLES.info
        }`}
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="text-white/80 hover:text-white"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
