import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
import SearchIcon from "../../public/assets/icons/Search.png";
import DownIcon from "../../public/assets/icons/Chevron-down.png";

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex items-center justify-between px-6 py-2 bg-white border-b">
            <div className="flex items-center space-x-2 border p-2 rounded-lg w-72">
                <img src={SearchIcon} alt="Search" width={16} height={16} />
                <input type="text" placeholder="Search..." className="outline-none w-full text-gray-600" />
            </div>

            <div className="relative" ref={menuRef}>
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <div className="relative w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">{user?.name || "Guest"}</p>
                        <p className="text-xs text-gray-500">{user?.isAdmin ? "Admin" : "User"}</p>
                    </div>
                    <img src={DownIcon} alt="Arrow" className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
                </div>

                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
                        <button onClick={logout} className="flex items-center justify-between w-full px-4 py-2 text-red-600 hover:bg-gray-100">
                            Log Out <FaSignOutAlt />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
