import { useEffect, useState } from "react";

const ToastHost = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleToast = (event) => {
            const { message } = event.detail || {};

            if (!message) return;

            const id = `${Date.now()}-${Math.random()}`;

            setToasts((currentToasts) => [
                ...currentToasts,
                { id, message },
            ]);

            window.setTimeout(() => {
                setToasts((currentToasts) =>
                    currentToasts.filter((toast) => toast.id !== id)
                );
            }, 2500);
        };

        window.addEventListener("app-toast", handleToast);

        return () => window.removeEventListener("app-toast", handleToast);
    }, []);

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="rounded-lg bg-gray-900 text-white px-4 py-3 shadow-lg shadow-black/20 min-w-[240px] max-w-[320px]"
                >
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            ))}
        </div>
    );
};

export default ToastHost;
