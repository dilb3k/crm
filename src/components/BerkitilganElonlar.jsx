import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://fast.uysavdo.com";
const PAGE_SIZE = 3; // Berkitilgan tab uchun sahifa o'lchami

const BerkitilganElonlar = () => {
    const [hiddenApartments, setHiddenApartments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // Berkitilgan e'lonlar uchun API endpoint
    const apiEndpoint = `${API_BASE_URL}/api/v1/adminka/hide_house/`;

    const fetchHiddenApartments = async (page) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Token yo'q!");
            setError("Token topilmadi");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log(`Fetching hidden apartments with page ${page} and size ${PAGE_SIZE}`);

            const response = await fetch(
                `${apiEndpoint}?page=${page}&size=${PAGE_SIZE}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`API xatolik qaytardi: ${response.status}`);
            }

            const data = await response.json();

            // Check if response has the expected format
            if (!data || !data.status) {
                throw new Error("API noto'g'ri formatda ma'lumot qaytardi");
            }

            // Handle the data based on the structure
            const apartmentsData = Array.isArray(data.data) ? data.data : [];

            setHiddenApartments(apartmentsData);
            setTotalCount(data.count || 0);
            setTotalPages(Math.max(1, Math.ceil((data.count || 0) / PAGE_SIZE)));
        } catch (error) {
            console.error("Fetch xatolik berdi:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchHiddenApartments(currentPage);
    }, [currentPage]);

    const handleRowClick = (apartmentId) => {
        navigate(`/apartment/${apartmentId}`);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Rasm URL-ni formatlab berish
    const formatImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/40";

        // Handle different image path formats
        if (imagePath.startsWith('uploads/house_images/')) {
            return `${API_BASE_URL}/${imagePath}`;
        } else if (imagePath.startsWith('house_images/')) {
            return `${API_BASE_URL}/uploads/${imagePath}`;
        } else if (imagePath.startsWith('noturar_images/') ||
            imagePath.startsWith('uploads/')) {
            return `${API_BASE_URL}/${imagePath}`;
        }

        return `${API_BASE_URL}/${imagePath}`;
    };

    const unhideApartment = async (apartmentId, event) => {
        // Prevent row click event
        event.stopPropagation();
        
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Token topilmadi");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/adminka/unhide_house/${apartmentId}`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`API xatolik qaytardi: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status) {
                // Refresh data after successful unhide
                fetchHiddenApartments(currentPage);
            } else {
                throw new Error(data.message || "E'lonni qayta ko'rsatishda xatolik yuz berdi");
            }
        } catch (error) {
            console.error("Unhide xatolik:", error);
            setError(error.message);
        }
    };

    if (loading && hiddenApartments.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-4 rounded-lg bg-white shadow-md">
                    <div className="flex items-center space-x-3">
                        <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg font-medium text-gray-700">Ma'lumotlar yuklanmoqda...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-6 rounded-lg bg-white shadow-md max-w-md w-full">
                    <div className="flex items-center justify-center text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Xatolik yuz berdi</h3>
                    <p className="text-gray-600 text-center">{error}</p>
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => {
                                setError(null);
                                fetchHiddenApartments(currentPage);
                            }}
                            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
                        >
                            Qayta urinish
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen px-4 pb-4">
            {/* Header */}
            <div className="mt-4 pt-4 flex items-center">
                <h1 className="font-inter font-medium text-2xl leading-8 text-gray-900">
                    E'lonlar ro'yxati
                </h1>
            </div>

            {/* Navigation Tabs with Gradient Text */}
            <div className="mt-4 flex items-center bg-gray-100 border-b border-gray-300 relative">
                <nav className="flex space-x-6 w-full">
                    {["Barchasi", "Gold e'lonlar", "Berkitilgan", "O'chirilgan"].map(
                        (item, index) => (
                            <span
                                key={index}
                                onClick={() => {
                                    navigate("/elonlar"); // Main component ga qaytish
                                }}
                                className="text-sm font-bold font-inter leading-tight cursor-pointer relative py-2"
                                style={
                                    item === "Berkitilgan"
                                        ? {
                                            background: "linear-gradient(117.4deg, #0AA3A1 0%, #B4C29E 96.03%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }
                                        : {
                                            color: "rgba(102, 112, 133, 1)",
                                        }
                                }
                            >
                                {item}
                                {item === "Berkitilgan" && (
                                    <span
                                        className="absolute bottom-0 left-0 w-full h-0.5"
                                        style={{
                                            bottom: "-1px",
                                            zIndex: 10,
                                            background: "linear-gradient(117.4deg, #0AA3A1 0%, #B4C29E 96.03%)",
                                        }}
                                    />
                                )}
                            </span>
                        )
                    )}
                </nav>
            </div>

            {/* Table */}
            <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr className="border-b border-gray-300">
                                {[
                                    "Rasm",
                                    "Tuman",
                                    "Kvartal",
                                    "Narxi",
                                    "Xonalar",
                                    "Maydon (m²)",
                                    "Sana",
                                    "Amallar"
                                ].map((header, index) => (
                                    <th
                                        key={index}
                                        className="p-4 text-left text-xs font-semibold font-inter text-gray-500 h-16"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {hiddenApartments.length > 0 ? (
                                hiddenApartments.map((apartment) => (
                                    <tr
                                        key={apartment.id}
                                        onClick={() => handleRowClick(apartment.id)}
                                        className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                                    >
                                        <td className="h-16 p-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={formatImageUrl(apartment.image1)}
                                                    alt="apartment"
                                                    className="w-10 h-10 object-cover rounded"
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                                                />
                                            </div>
                                        </td>
                                        <td className="h-16 p-4">{apartment.tuman || "Noma'lum"}</td>
                                        <td className="h-16 p-4">{apartment.kvartl || "Noma'lum"}</td>
                                        <td className="h-16 p-4 font-semibold">${apartment.narxi?.toLocaleString() || "Noma'lum"}</td>
                                        <td className="h-16 p-4">{apartment.xona_soni || "Noma'lum"}</td>
                                        <td className="h-16 p-4">{apartment.maydon || "Noma'lum"} m²</td>
                                        <td className="h-16 p-4">{new Date(apartment.created_at).toLocaleDateString("uz-UZ") || "Noma'lum"}</td>
                                        <td className="h-16 p-4">
                                            <button
                                                onClick={(e) => unhideApartment(apartment.id, e)}
                                                className="px-3 py-1.5 bg-teal-500 text-white text-xs rounded hover:bg-teal-600 transition"
                                            >
                                                Ko'rsatish
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-8 text-gray-500">Ma'lumot topilmadi</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Jami: {totalCount} ta berkitilgan e'lon
                    </div>
                    <div className="flex space-x-2 items-center">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                        >
                            Oldingi
                        </button>
                        <div className="px-4 text-sm text-gray-700">
                            {currentPage} / {totalPages}
                        </div>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1.5 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                        >
                            Keyingi
                        </button>
                    </div>
                </div>
            )}

            {/* Loading indicator for pagination */}
            {loading && hiddenApartments.length > 0 && (
                <div className="mt-4 flex justify-center">
                    <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-gray-500">Yuklanmoqda...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BerkitilganElonlar;