import React, { useEffect, useRef, useState } from "react";
import { Menu, Search, User, LogOut, UserCircle, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import UploadVideoModal from "../UploadVideoModal";

const Navbar = ({ toggleSidebar = () => { } }) => {
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const { authUser, getMe, logout } = useAuthStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        getMe();
    }, [getMe]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setMenuOpen(false);
        navigate("/login");
    };

    return (
        <nav className="w-full border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="rounded-full p-2 transition hover:bg-gray-100"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>

                    <img
                        onClick={() => navigate("/")}
                        src="/images.png"
                        alt="Logo"
                        className="h-auto w-28 cursor-pointer object-contain md:w-35"
                    />
                </div>

                <div className="hidden flex-1 max-w-2xl mx-4 md:flex">
                    <div className="flex w-full">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full rounded-l-full border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                        />
                        <button
                            type="button"
                            className="cursor-pointer rounded-r-full border border-l-0 border-gray-300 bg-gray-100 px-5 py-2 transition hover:bg-gray-200"
                            aria-label="Search"
                        >
                            <Search size={20} className="text-gray-700" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {authUser ? (
                        <>
                            {/* Upload Video Button */}
                            <button
                                type="button"
                                onClick={() => setIsUploadOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition cursor-pointer"
                            >
                                <Upload size={18} />
                                <span className="hidden sm:inline">Upload</span>
                            </button>

                            <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((prev) => !prev)}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 transition hover:bg-gray-200"
                                aria-label="Open user menu"
                            >
                                {authUser.avatar ? (
                                    <img
                                        src={authUser.avatar}
                                        alt={authUser.fullName || authUser.username || "User"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User size={18} className="text-gray-700" />
                                )}
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/profile");
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                    >
                                        <UserCircle size={16} />
                                        Profile
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                            </div>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="rounded-full border border-blue-400 px-4 py-1.5 text-[18px] font-medium text-blue-500 transition hover:bg-blue-50"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3 flex md:hidden">
                <div className="flex w-full">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full rounded-l-full border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                    />
                    <button
                        type="button"
                        className="cursor-pointer rounded-r-full border border-l-0 border-gray-300 bg-gray-100 px-5 py-2 transition hover:bg-gray-200"
                    >
                        <Search size={20} className="text-gray-700" />
                    </button>
                </div>
            </div>

            {/* Upload Video Modal */}
            {isUploadOpen && (
                <UploadVideoModal onClose={() => setIsUploadOpen(false)} />
            )}
        </nav>
    );
};

export default Navbar;