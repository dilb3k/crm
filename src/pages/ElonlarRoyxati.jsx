import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 15;

const ElonlarRoyxati = () => {
    const [apartments, setApartments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("Barchasi");
    const [goldApartments] = useState([]);
    const [hiddenApartments] = useState([]);
    const [deletedApartments] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const navigate = useNavigate();

    const lastApartmentElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreData();
            }
        }, { threshold: 0.5 });

        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const loadMoreData = () => {
        if (currentPage >= Math.ceil(totalCount / PAGE_SIZE)) {
            setHasMore(false);
            return;
        }

        setCurrentPage(prevPage => prevPage + 1);
        setLoadingMore(true);
    };

    const fetchApartments = async (page) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Token yo'q!");
            setError("Token topilmadi");
            setLoading(false);
            setLoadingMore(false);
            return;
        }

        try {
            const response = await fetch(
                `https://fast.uysavdo.com/api/v1/adminka/get_house/?page=${page}&size=${PAGE_SIZE}`,
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

            if (!data || !Array.isArray(data.data)) {
                throw new Error("API noto'g'ri formatda ma'lumot qaytardi");
            }

            if (page === 1) {
                setApartments(data.data);
            } else {
                setApartments(prev => [...prev, ...data.data]);
            }

            setTotalCount(data.count);

            if (data.data.length < PAGE_SIZE || page >= Math.ceil(data.count / PAGE_SIZE)) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error("Fetch xatolik berdi:", error);
            setError(error.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        setHasMore(true);
        fetchApartments(1);
    }, [activeTab]);

    useEffect(() => {
        if (currentPage > 1) {
            fetchApartments(currentPage);
        }
    }, [currentPage]);

    const displayedApartments = () => {
        if (activeTab === "Barchasi") return apartments;
        if (activeTab === "Gold e'lonlar") return goldApartments;
        if (activeTab === "Berkitilgan") return hiddenApartments;
        if (activeTab === "O'chirilgan") return deletedApartments;
        return [];
    };

    const handleRowClick = (apartmentId) => {
        navigate(`/apartment/${apartmentId}`);
    };

    if (loading && currentPage === 1) {
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
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen px-[16px] pb-[16px]">
            {/* Header */}
            <div className="mt-[16px] h-[34px] pt-4 flex items-center">
                <h1 className="font-inter font-medium text-[28px] leading-[34px] text-gray-900">
                    E'lonlar ro'yxati
                </h1>
            </div>

            {/* Navigation Tabs with Gradient Text */}
            <div className="mt-[16px] h-[34px] flex items-center bg-gray-100 border-b border-gray-300 relative">
                <nav className="flex space-x-[24px] w-full">
                    {["Barchasi", "Gold e'lonlar", "Berkitilgan", "O'chirilgan"].map(
                        (item, index) => (
                            <span
                                key={index}
                                onClick={() => {
                                    setActiveTab(item);
                                    setCurrentPage(1);
                                }}
                                className="text-[14px] font-bold font-inter leading-[140%] tracking-[0.5%] cursor-pointer relative"
                                style={
                                    activeTab === item
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
                                {activeTab === item && (
                                    <span
                                        className="absolute bottom-0 left-0 w-full h-[1px]"
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
            <div className="mt-4 bg-white rounded-lg shadow">
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
                            ].map((header, index) => (
                                <th
                                    key={index}
                                    className="p-4 text-left text-[12px] font-semibold font-inter tracking-[0.5%] bg-white text-[#858D9D] h-[64px]"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayedApartments().length > 0 ? (
                            displayedApartments().map((apartment, index) => {
                                // Apply ref to the last element
                                const isLastElement = index === displayedApartments().length - 1;

                                return (
                                    <tr
                                        key={apartment.id}
                                        ref={isLastElement ? lastApartmentElementRef : null}
                                        onClick={() => handleRowClick(apartment.id)}
                                        className="hover:bg-gray-50 cursor-pointer"
                                    >
                                        <td className="h-[64px] flex items-center pl-[24px]">
                                            <img
                                                src={apartment.image1
                                                    ? `https://fast.uysavdo.com/uploads/${apartment.image1.replace('home_images/', '')}`
                                                    : "https://via.placeholder.com/40"}
                                                alt="apartment"
                                                className="w-10 h-10 object-cover rounded"
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                                            />
                                        </td>
                                        <td className="h-[64px] px-4">{apartment.tuman || "Noma'lum"}</td>
                                        <td className="h-[64px] px-4">{apartment.kvartl || "Noma'lum"}</td>
                                        <td className="h-[64px] px-4 font-semibold">${apartment.narxi?.toLocaleString() || "Noma'lum"}</td>
                                        <td className="h-[64px] px-4">{apartment.xona_soni || "Noma'lum"}</td>
                                        <td className="h-[64px] px-4">{apartment.maydon || "Noma'lum"} m²</td>
                                        <td className="h-[64px] px-4">{new Date(apartment.created_at).toLocaleDateString("uz-UZ") || "Noma'lum"}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 h-[64px]">Ma'lumot topilmadi</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Loading indicator for infinite scroll */}
            {loadingMore && (
                <div className="flex justify-center items-center py-6">
                    <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-600">Yuklanmoqda...</span>
                    </div>
                </div>
            )}

            {/* End of content indicator */}
            {!hasMore && apartments.length > 0 && (
                <div className="text-center py-6 text-gray-500">
                    <div className="flex justify-center items-center">
                        <div className="bg-gray-200 h-[1px] w-16"></div>
                        <span className="mx-3">Barcha ma'lumotlar yuklandi</span>
                        <div className="bg-gray-200 h-[1px] w-16"></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        Jami: {totalCount} e'lon
                    </div>
                </div>
            )}

            {/* Pagination status indicator */}
            <div className="text-center py-3 text-sm text-gray-500">
                {currentPage} / {Math.ceil(totalCount / PAGE_SIZE)} sahifa
            </div>
        </div>
    );
};

export default ElonlarRoyxati;