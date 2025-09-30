// src/components/Toast.jsx
import { Toaster, toast } from "react-hot-toast";

/**
 * Toast component wrapper
 * Place <Toast /> once in your App.jsx (usually at the root)
 * Then you can call toast.success(), toast.error(), etc. anywhere
 */
import App from "../App";

const Toast = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
                // Default styles
                success: {
                    style: {
                        background: "#4CAF50",
                        color: "#fff",
                    },
                    iconTheme: {
                        primary: "#fff",
                        secondary: "#4CAF50",
                    },
                },
                error: {
                    style: {
                        background: "#F44336",
                        color: "#fff",
                    },
                    iconTheme: {
                        primary: "#fff",
                        secondary: "#F44336",
                    },
                },
            }}
        />
    );
};

export default Toast;

// Export toast functions so you can use them directly
export { toast };
