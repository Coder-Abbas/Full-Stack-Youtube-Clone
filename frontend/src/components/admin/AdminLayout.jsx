import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Video,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    Shield,
    X,
    Home,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const AdminSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const menuItems = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Videos", path: "/admin/videos", icon: Video },
        { name: "Comments", path: "/admin/comments", icon: MessageSquare },
        { name: "Settings", path: "/admin/settings", icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <aside
            className={`
                fixed
                left-0
                top-0
                bottom-0
                z-50
                bg-white
                border-r
                border-gray-200
                transition-all
                duration-300
                ${isOpen ? "w-64" : "w-20"}
                md:relative md:translate-x-0
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
        >
            <div className="h-full flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center justify-between border-b border-gray-200 px-4">
                    {isOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                                </svg>
                            </div>
                            <span className="font-bold text-gray-900 text-lg">Admin</span>
                        </div>
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 mx-auto">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                            </svg>
                        </div>
                    )}
                    {isOpen && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                            <X size={18} className="text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`
                                    flex
                                    items-center
                                    gap-3
                                    px-3
                                    py-2.5
                                    rounded-xl
                                    transition-all
                                    duration-200
                                    cursor-pointer
                                    ${active
                                        ? "bg-red-50 text-red-600 font-medium"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }
                                `}
                            >
                                <Icon size={20} className="shrink-0" />
                                {isOpen && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="
                            flex
                            items-center
                            gap-3
                            w-full
                            px-3
                            py-2.5
                            rounded-xl
                            text-red-600
                            hover:bg-red-50
                            transition-all
                            duration-200
                            cursor-pointer
                        "
                    >
                        <LogOut size={20} className="shrink-0" />
                        {isOpen && <span className="text-sm whitespace-nowrap">Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

const AdminNavbar = ({ onToggleSidebar, isSidebarOpen }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200">
            <div className={`flex items-center h-full px-4 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer md:hidden"
                >
                    <Menu size={22} className="text-gray-700" />
                </button>

                <div className="flex items-center gap-3 ml-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                            <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                </div>
            </div>
        </header>
    );
};

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main
                className={`
                    pt-16
                    min-h-screen
                    transition-all
                    duration-300
                    ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}
                `}
            >
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
