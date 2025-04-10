import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FilterHouse from "../components/FilterHouse";

// Har bir tab uchun sahifa o'lchami
const getPageSizeForTab = (tab) => {
    // Boshqa tablar uchun 15
    return 15;
};

const API_BASE_URL = "https://fast.uysavdo.com";

// Lokal placeholder rasm (base64 formatida), tashqi serverga bog'liq bo'lmaslik uchun
const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk4vQTwvdGV4dD48L3N2Zz4=";

const ElonlarRoyxati = () => {
    const [allApartments, setAllApartments] = useState([]);
    const [goldApartments, setGoldApartments] = useState([]);
    const [hiddenApartments, setHiddenApartments] = useState([]);
    const [deletedApartments, setDeletedApartments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("Barchasi");
    const [hasMore, setHasMore] = useState(true);
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const observer = useRef();
    const navigate = useNavigate();
    const previousTab = useRef("Barchasi");

    // Ma'lumotlarni olish kechiktirilgan vaqtni nazorat qilish
    const fetchTimeoutRef = useRef(null);

    // So'ngi so'rovni kuzatish
    const lastFetchTimeRef = useRef(0);

    // Get the correct API endpoint based on the active tab
    const getApiEndpointForTab = (tab, isFiltered = false) => {
        // Agar filter qilingan so'rov bo'lsa
        if (isFiltered) {
            return `${API_BASE_URL}/api/v1/adminka/houses/filter`;
        }
        
        switch (tab) {
            case "Barchasi":
                return `${API_BASE_URL}/api/v1/adminka/get_house/`;
            case "Gold e'lonlar":
                return `${API_BASE_URL}/api/v1/adminka/gold_house/`;
            case "Berkitilgan":
                return `${API_BASE_URL}/api/v1/adminka/hide_house/`;
            case "O'chirilgan":
                return `${API_BASE_URL}/api/v1/adminka/delete_house/`;
            default:
                return `${API_BASE_URL}/api/v1/adminka/get_house/`;
        }
    };

    // Aktiv tabga qarab ma'lumotlarni ko'rsatish
    const getDisplayedApartments = () => {
        switch (activeTab) {
            case "Barchasi":
                return allApartments;
            case "Gold e'lonlar":
                return goldApartments;
            case "Berkitilgan":
                return hiddenApartments;
            case "O'chirilgan":
                return deletedApartments;
            default:
                return [];
        }
    };

    // Aktiv tab uchun state setter funksiyani olish
    const getStateSetterForTab = (tab) => {
        switch (tab) {
            case "Barchasi":
                return setAllApartments;
            case "Gold e'lonlar":
                return setGoldApartments;
            case "Berkitilgan":
                return setHiddenApartments;
            case "O'chirilgan":
                return setDeletedApartments;
            default:
                return setAllApartments;
        }
    };

    // Token olish va xatoliklarni tekshirish
    const getToken = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Token yo'q!");
            setError("Token topilmadi");
            setLoading(false);
            setLoadingMore(false);

            // Token yo'q bo'lsa login sahifasiga yo'naltirish
            navigate("/login");
            return null;
        }
        return token;
    };

    const fetchApartments = async (page, filterData = null) => {
        // So'rovlar orasidagi minimal vaqt 500ms (throttling)
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTimeRef.current;

        if (timeSinceLastFetch < 500) {
            // Agar so'nggi so'rovdan kam vaqt o'tgan bo'lsa, kechiktirish
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = setTimeout(() => {
                fetchApartments(page, filterData);
            }, 500 - timeSinceLastFetch);
            return;
        }

        // So'nggi so'rov vaqtini yangilash
        lastFetchTimeRef.current = now;

        const token = getToken();
        if (!token) return;

        try {
            // Determine API endpoint and HTTP method based on whether we're filtering
            const isFiltered = filterData !== null;
            const apiEndpoint = getApiEndpointForTab(activeTab, isFiltered);
            const pageSize = getPageSizeForTab(activeTab);
            const stateSetter = getStateSetterForTab(activeTab);
            const method = isFiltered ? "POST" : "GET";

            console.log(`Fetching data for ${activeTab} with page size ${pageSize}, filtered: ${isFiltered}`);

            // Prepare request options
            const requestOptions = {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            // Set URL and body based on request type
            let url = apiEndpoint;
            if (isFiltered) {
                // For filter requests, we send parameters in the body
                requestOptions.body = JSON.stringify({
                    ...filterData,
                    skip: (page - 1) * pageSize,
                    limit: pageSize
                });
                console.log("Filter request body:", requestOptions.body);
            } else {
                // For regular requests, we use query parameters
                url = `${apiEndpoint}?page=${page}&size=${pageSize}`;
            }

            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                // Agar token muammosi bo'lsa (401 yoki 403)
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token"); // Tokeni o'chirish
                    navigate("/login"); // Login sahifasiga yo'naltirish
                    throw new Error("Token xatoligi. Qayta login qiling");
                }
                throw new Error(`API xatolik qaytardi: ${response.status}`);
            }

            const data = await response.json();

            // Check if response has the expected format
            if (!data || !data.status) {
                throw new Error("API noto'g'ri formatda ma'lumot qaytardi");
            }

            // Handle the data based on the structure
            const apartmentsData = Array.isArray(data.data) ? data.data : [];

            // Ma'lumotlarni to'g'ri state-ga saqlash
            if (page === 1) {
                stateSetter(apartmentsData);
            } else {
                stateSetter(prev => [...prev, ...apartmentsData]);
            }

            setTotalCount(data.count || 0);

            // Check if there are more pages to load
            setHasMore(data.has_next || false);
        } catch (error) {
            console.error("Fetch xatolik berdi:", error);
            setError(error.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Tab o'zgarganda ma'lumotlarni yuklash
    useEffect(() => {
        // Tokeni tekshirish
        const token = getToken();
        if (!token) return;

        // Oldingi so'rovlarni bekor qilish
        clearTimeout(fetchTimeoutRef.current);

        previousTab.current = activeTab;

        // Agar filter aktiv bo'lsa, filter bilan yuklash
        if (isFilterActive) {
            setLoading(true);
            setHasMore(true);
            setCurrentPage(1);
            fetchApartments(1, activeFilters);
        } else {
            setLoading(true);
            setHasMore(true);
            setCurrentPage(1);

            const currentData = getDisplayedApartments();
            if (currentData.length === 0) {
                fetchApartments(1);
            } else {
                setLoading(false);
            }
        }

        // Component unmount bo'lganda timeout tozalash
        return () => {
            clearTimeout(fetchTimeoutRef.current);
        };
    }, [activeTab, isFilterActive, activeFilters]);

    // Sahifa o'zgarganda qo'shimcha ma'lumotlar yuklash
    useEffect(() => {
        if (currentPage > 1) {
            if (isFilterActive) {
                fetchApartments(currentPage, activeFilters);
            } else {
                fetchApartments(currentPage);
            }
        }
    }, [currentPage]);

    // Qo'shimcha ma'lumotlarni yuklash
    const loadMoreData = useCallback(() => {
        if (loadingMore) return;

        const pageSize = getPageSizeForTab(activeTab);

        if (currentPage >= Math.ceil(totalCount / pageSize)) {
            setHasMore(false);
            return;
        }

        setCurrentPage(prevPage => prevPage + 1);
        setLoadingMore(true);
    }, [activeTab, currentPage, totalCount, loadingMore]);

    // Infinite scroll uchun observer
    const lastApartmentElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreData();
            }
        }, { threshold: 0.5 });

        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, loadMoreData]);

    const handleRowClick = (apartmentId) => {
        navigate(`/apartment/${apartmentId}`);
    };

    // Rasm URL-ni formatlab berish
    const formatImageUrl = (imagePath) => {
        if (!imagePath) return DEFAULT_IMAGE;

        try {
            return `${API_BASE_URL}/image/${imagePath}`;
        } catch (error) {
            console.error("Rasm URL formatida xatolik:", error);
            return DEFAULT_IMAGE;
        }
    };

    // Filterni qo'llash uchun handler
    const handleApplyFilter = (filterData) => {
        console.log("Applying filter:", filterData);
        setActiveFilters(filterData);
        setIsFilterActive(Object.keys(filterData).length > 0);
        setCurrentPage(1);
        setLoading(true);
    };

    const displayedApartments = getDisplayedApartments();

    // Tab bosilganda yangi tabga o'tish
    const handleTabClick = (tabName) => {
        if (activeTab !== tabName) {
            setActiveTab(tabName);
            setCurrentPage(1);
            
            // Agar O'chirilgan tabiga o'tilsa, filterni o'chirish
            if (tabName === "O'chirilgan") {
                setIsFilterActive(false);
                setActiveFilters({});
            }
        }
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
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                const token = getToken();
                                if (isFilterActive) {
                                    fetchApartments(1, activeFilters);
                                } else {
                                    fetchApartments(1);
                                }
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

    // Tablarni qayta tartiblash - Berkitilgan va Gold e'lonlar o'rinlarini almashtirish
    const tabOrder = ["Barchasi", "Berkitilgan", "Gold e'lonlar", "O'chirilgan"];

    return (
        <div className="bg-gray-100 min-h-screen px-4 pb-4">
            {/* Header */}
            <div className="mt-4 pt-4 flex items-center justify-between">
                <h1 className="font-inter font-medium text-2xl leading-8 text-gray-900">
                    E'lonlar ro'yxati
                </h1>
                <button
                    onClick={() => navigate("/add-apartment")}
                    className="bg-gradient-to-r from-teal-500 to-green-400 text-white px-6 py-2 rounded-lg font-medium"
                >
                    E'lon qo'shish+
                </button>
            </div>

            {/* Filter component */}
            {activeTab !== "O'chirilgan" && (
                <FilterHouse onApplyFilter={handleApplyFilter} />
            )}

            {/* Filter active indicator */}
            {isFilterActive && activeTab !== "O'chirilgan" && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Filter faol: {Object.keys(activeFilters).length} ta mezon
                                <button 
                                    onClick={() => {
                                        setIsFilterActive(false);
                                        setActiveFilters({});
                                        setCurrentPage(1);
                                        fetchApartments(1);
                                    }}
                                    className="ml-2 text-blue-500 hover:text-blue-700 font-medium"
                                >
                                    Filterni bekor qilish
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs with Gradient Text */}
            <div className="mt-4 flex items-center bg-gray-100 border-b border-gray-300 relative">
                <nav className="flex space-x-6 w-full">
                    {tabOrder.map((item, index) => {
                        // Fixed tab rendering logic
                        if (item === "Gold e'lonlar" && activeTab === "O'chirilgan") {
                            // Gold e'lonlar completely disabled in O'chirilgan tab
                            return (
                                <button
                                    key={index}
                                    disabled
                                    className="text-sm font-bold font-inter leading-tight relative py-2 flex items-center cursor-not-allowed opacity-50 text-gray-400"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    {item}
                                </button>
                            );
                        } else {
                            // Normal tab behavior
                            return (
                                <span
                                    key={index}
                                    onClick={() => handleTabClick(item)}
                                    className="text-sm font-bold font-inter leading-tight relative py-2 cursor-pointer"
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
                                            className="absolute bottom-0 left-0 w-full h-0.5"
                                            style={{
                                                bottom: "-1px",
                                                zIndex: 10,
                                                background: "linear-gradient(117.4deg, #0AA3A1 0%, #B4C29E 96.03%)",
                                            }}
                                        />
                                    )}
                                </span>
                            );
                        }
                    })}
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
                            {displayedApartments.length > 0 ? (
                                displayedApartments.map((apartment, index) => {
                                    // Apply ref to the last element
                                    const isLastElement = index === displayedApartments.length - 1;

                                    return (
                                        <tr
                                            key={apartment.id}
                                            ref={isLastElement ? lastApartmentElementRef : null}
                                            onClick={() => handleRowClick(apartment.id)}
                                            className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                                        >
                                            <td className="h-16 p-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={formatImageUrl(apartment.image1)}
                                                        alt="apartment"
                                                        className="w-10 h-10 object-cover rounded"
                                                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </td>
                                            <td className="h-16 p-4">{apartment.tuman || "Noma'lum"}</td>
                                            <td className="h-16 p-4">{apartment.kvartl || "Noma'lum"}</td>
                                            <td className="h-16 p-4 font-semibold">${apartment.narxi?.toLocaleString() || "Noma'lum"}</td>
                                            <td className="h-16 p-4">{apartment.xona_soni || "Noma'lum"}</td>
                                            <td className="h-16 p-4">{apartment.maydon || "Noma'lum"} m²</td>
                                            <td className="h-16 p-4">
                                                {apartment.created_at ? new Date(apartment.created_at).toLocaleDateString("uz-UZ") : "Noma'lum"}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-500">Ma'lumot topilmadi</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
            {!hasMore && displayedApartments.length > 0 && (
                <div className="text-center py-6 text-gray-500">
                    <div className="flex justify-center items-center">
                        <div className="bg-gray-200 h-px w-16"></div>
                        <span className="mx-3">Barcha ma'lumotlar yuklandi</span>
                        <div className="bg-gray-200 h-px w-16"></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        Jami: {totalCount} e'lon
                    </div>
                </div>
            )}

            {/* Pagination status indicator */}
            <div className="text-center py-3 text-sm text-gray-500">
                {currentPage} / {Math.max(1, Math.ceil(totalCount / getPageSizeForTab(activeTab)))} sahifa
            </div>
        </div>
    );
};

export default ElonlarRoyxati;