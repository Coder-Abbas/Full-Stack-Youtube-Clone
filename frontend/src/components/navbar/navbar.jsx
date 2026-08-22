import React, { useEffect, useRef, useState } from "react";
import {
    Menu,
    Search,
    User,
    LogOut,
    UserCircle,
    Upload,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useSearchStore from "../../store/searchStore";
import UploadVideoModal from "../UploadVideoModal";
import toast from "react-hot-toast";

const Navbar = ({ toggleSidebar = () => {} }) => {
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);

    const { authUser, getMe, logout } = useAuthStore();

    // Search Zustand
    const { search } = useSearchStore();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Mobile search dropdown state (icon-only in header on mobile,
    // expands into a dropdown below the header when clicked)
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        // Only fetch the current user once when not already authenticated.
        // Avoids re-fetching on every route change (Navbar remounts per page).
        if (!authUser) {
            getMe();
        }
    }, [authUser, getMe]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }

            const isDesktopSearch =
                desktopSearchRef.current &&
                desktopSearchRef.current.contains(event.target);
            const isMobileSearch =
                mobileSearchRef.current &&
                mobileSearchRef.current.contains(event.target);

            if (!isDesktopSearch && !isMobileSearch) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();

        setMenuOpen(false);

        navigate("/");

        toast.success("Logged out successfully!");
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        const query = searchText.trim();

        if (!query) return;

        await search(query);

        navigate(`/search?q=${encodeURIComponent(query)}`);

        setSearchOpen(false);
        setSearchText("");
    };

    return (
        <nav className="w-full border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="rounded-full p-2 transition cursor-pointer hover:bg-gray-100"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>

                    <img
                        onClick={() => navigate("/")}
                        src="/images.png"
                        alt="Logo"
                        className="logo-responsive h-auto w-28 cursor-pointer object-contain md:w-32"
                    />
                </div>

                {/* ==============================
                    DESKTOP SEARCH (>= 750px)
                    Integrated into the header row, aligned with the
                    logo and menu. Visible + expanded by default.
                ============================== */}

                <div
                    ref={desktopSearchRef}
                    className="hidden min-[750px]:flex flex-1 justify-center mx-4"
                >
                    <form
                        onSubmit={handleSearch}
                        className="flex w-full max-w-2xl items-stretch"
                    >
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="
                                w-full
                                rounded-l-full
                                border
                                border-gray-300
                                px-4
                                py-2
                                outline-none
                                focus:border-gray-500
                                transition
                            "
                        />

                        <button
                            type="submit"
                            className="
                                cursor-pointer
                                rounded-r-full
                                border
                                border-l-0
                                border-gray-300
                                bg-gray-100
                                px-5
                                py-2
                                transition
                                hover:bg-gray-200
                            "
                            aria-label="Search"
                        >
                            <Search size={20} className="text-gray-700" />
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-3">
                    {/* Mobile search icon — lives in the header row,
                        collapses to a dropdown below the header when tapped */}
                    <button
                        type="button"
                        onClick={() => setSearchOpen(true)}
                        className="
                            p-2.5
                            rounded-full
                            hover:bg-gray-200
                            transition
                            text-gray-700
                            min-[750px]:hidden
                        "
                        aria-label="Open search"
                    >
                        <Search size={21} />
                    </button>

                    {authUser ? (
                        <>
                            {/* Upload Video Button */}

                            <button
                                type="button"
                                onClick={() => setIsUploadOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition cursor-pointer"
                            >
                                <Upload size={18} />

                                <span className="hidden sm:inline">
                                    Upload
                                </span>
                            </button>

                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setMenuOpen((prev) => !prev)
                                    }
                                    className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 transition hover:bg-gray-200"
                                    aria-label="Open user menu"
                                >
                                    {authUser.avatar ? (
                                        <img
                                            src={authUser.avatar}
                                            alt={
                                                authUser.fullName ||
                                                authUser.username ||
                                                "User"
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User
                                            size={18}
                                            className="text-gray-700"
                                        />
                                    )}
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                                        <Link
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                            }}
                                            to="/profile"
                                            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                        >
                                            <UserCircle size={16} />

                                            Profile
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex cursor-pointer w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                        >
                                            <LogOut size={16} />

                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            type="button"
                            to="/login"
                            className="rounded-full border cursor-pointer border-blue-500 px-4 py-2 text-[18px] font-medium text-blue-500 transition hover:bg-blue-50"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* ==============================
                MOBILE SEARCH DROPDOWN (< 750px)
                Hidden by default; the header icon above toggles
                this full-width input that drops below the header.
            ============================== */}

            {searchOpen && (
                <div
                    ref={mobileSearchRef}
                    className="mobile-search-dropdown mt-3 flex min-[750px]:hidden"
                >
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="flex w-full items-stretch">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchText}
                                onChange={(e) =>
                                    setSearchText(e.target.value)
                                }
                                autoFocus
                                className="
                                    w-full
                                    rounded-l-full
                                    border
                                    border-gray-300
                                    px-4
                                    py-2
                                    outline-none
                                    focus:border-gray-500
                                    transition
                                "
                            />

                            <button
                                type="submit"
                                className="
                                    cursor-pointer
                                    rounded-r-full
                                    border
                                    border-l-0
                                    border-gray-300
                                    bg-gray-100
                                    px-5
                                    py-2
                                    transition
                                    hover:bg-gray-200
                                "
                            >
                                <Search size={20} className="text-gray-700" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Upload Video Modal */}

            {isUploadOpen && (
                <UploadVideoModal onClose={() => setIsUploadOpen(false)} />
            )}
        </nav>
    );
};

export default Navbar;