import React from "react";
import { Menu, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {

    // Later, get this from Zustand/Auth API
    const user = null;

    const navigate = useNavigate();

    return (
        <nav className="w-full bg-white border-b border-gray-200 px-4 py-3">

            <div className="flex items-center justify-between gap-4">

                {/* Left Section */}
                <div className="flex items-center gap-4">

                    {/* Menu Button */}
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
                        aria-label="Toggle sidebar"
                    >
                        <Menu
                            size={24}
                            className="text-gray-700"
                        />
                    </button>

                    {/* Logo */}
                    <img
                        onClick={() => navigate("/")}
                        src="/images.png"
                        alt="Logo"
                        className="w-27 md:w-35 h-auto object-contain cursor-pointer"
                    />

                </div>

                {/* Search Section */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-4">

                    <div className="flex w-full">

                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-l-full outline-none focus:border-blue-500"
                        />

                        <button
                            type="button"
                            className="px-5 py-2 bg-gray-100 border cursor-pointer border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200 transition"
                            aria-label="Search"
                        >
                            <Search
                                size={20}
                                className="text-gray-700"
                            />
                        </button>

                    </div>

                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">

                    {user ? (

                        <button
                            type="button"
                            className="w-10 h-10 rounded-full cursor-pointer overflow-hidden border border-gray-200"
                        >
                            <img
                                src={user.profilePicture}
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        </button>

                    ) : (

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="px-4 py-1 text-[18px] font-medium cursor-pointer text-blue-500 border border-blue-400 rounded-full hover:bg-blue-50 transition"
                            >
                                Login
                            </button>
                        </div>

                    )}

                </div>

            </div>

            {/* Mobile Search */}
            <div className="flex md:hidden mt-3">

                <div className="flex w-full">

                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-l-full outline-none focus:border-blue-500"
                    />

                    <button
                        type="button"
                        className="px-5 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full cursor-pointer hover:bg-gray-200 transition"
                    >
                        <Search
                            size={20}
                            className="text-gray-700"
                        />
                    </button>

                </div>

            </div>

        </nav>
    );
};

export default Navbar;