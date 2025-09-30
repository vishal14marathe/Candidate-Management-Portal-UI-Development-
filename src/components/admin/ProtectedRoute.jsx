import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const email = sessionStorage.getItem("email");
    const password = sessionStorage.getItem("password");

    if (email === "admin@example.com" && password === "adminPass") {
        return children;
    } else {
        return <Navigate to="/admin/login" replace />;
    }
};

export default ProtectedRoute;
