import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const PublicRoute = ({ children }) => {
    const { authUser, isCheckingAuth } = useAuthStore();

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (authUser) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;
