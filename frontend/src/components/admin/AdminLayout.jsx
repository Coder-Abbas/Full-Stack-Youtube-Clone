import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Video,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    Home
} from "lucide-react";

import useAuthStore from "../../store/authStore";

const SIDEBAR_WIDTH_OPEN = "w-[220px]";
const SIDEBAR_WIDTH_CLOSED = "w-[72px]";
const MAIN_MARGIN_OPEN = "md:ml-[220px]";
const MAIN_MARGIN_CLOSED = "md:ml-[72px]";

const AdminSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const menuItems = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        {name: "Home", path: "/", icon: Home},
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

    const getMenuItemClasses = (isActiveItem) => {
        const baseClasses = "group flex items-center py-3 rounded-xl cursor-pointer transition-all duration-200";
        const sizeClasses = isOpen ? "gap-5 px-5" : "justify-center px-1";
        const stateClasses = isActiveItem
            ? "bg-red-50 text-red-600 font-semibold"
            : "text-gray-700 hover:bg-gray-100 hover:text-black";
        return `${baseClasses} ${sizeClasses} ${stateClasses}`;
    };

    const getLogoutClasses = () => {
        const baseClasses = "group flex items-center w-full py-3 rounded-xl cursor-pointer transition-all duration-200 text-red-600 hover:bg-red-50";
        const sizeClasses = isOpen ? "gap-5 px-5" : "justify-center px-1";
        return `${baseClasses} ${sizeClasses}`;
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed
                    left-0
                    top-16
                    bottom-0
                    z-40 max-[750px]:z-[9999]!
                    bg-white
                    border-r
                    border-gray-200
                    transition-all
                    duration-300
                    ease-in-out
                    ${isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED}
                    -translate-x-full md:translate-x-0
                    ${isOpen ? "translate-x-0" : ""}
                    overflow-hidden
                `}
            >
                <div className="h-full overflow-y-auto px-3 py-4">
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={getMenuItemClasses(active)}
                                >
                                    <Icon size={22} className="flex shrink-0 transition-transform" />

                                    {isOpen && (
                                        <span className="text-sm whitespace-nowrap">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="my-4 border-t border-gray-200" />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className={getLogoutClasses()}
                    >
                        <LogOut size={22} className="flex shrink-0 transition-transform" />

                        {isOpen && (
                            <span className="text-sm whitespace-nowrap">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

const AdminNavbar = ({ onToggleSidebar }) => {
    return (
        <header
            className="
                fixed
                top-0
                left-0
                right-0
                z-50
                h-16
                bg-white
                border-b
                border-gray-200
                px-4
                py-3
                shadow-sm
            "
        >
            <div className="flex items-center h-full">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} className="text-gray-700" />
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
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavbar onToggleSidebar={toggleSidebar} />
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main
                className={`
                    pt-16
                    min-h-screen
                    transition-all
                    duration-300
                    ${isSidebarOpen ? MAIN_MARGIN_OPEN : MAIN_MARGIN_CLOSED}
                `}
            >
                <div className="p-4 md:p-6 max-w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
