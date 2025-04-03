import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditApartmentForm from "./EditApartmentForm";

// Lokal placeholder rasm (base64 formatida), tashqi serverga bog'liq bo'lmaslik uchun
const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjE2IiBoZWlnaHQ9IjIxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjE2IiBoZWlnaHQ9IjIxNiIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5NGEzYjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5SYXNtIHlvJ3E8L3RleHQ+PC9zdmc+";

// Kichik rasmlar uchun placeholder
const THUMBNAIL_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFBob3RvPC90ZXh0Pjwvc3ZnPg==";

const API_BASE_URL = "https://fast.uysavdo.com";

const ApartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [largeImage, setLargeImage] = useState(DEFAULT_IMAGE);
    const [smallImages, setSmallImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchApartment();
    }, [id]);

    // Rasm URL-ni to'g'ri formatda olish
    const formatImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        try {
            return `${API_BASE_URL}/image/${imagePath}`;
        } catch (error) {
            console.error("Rasm URL formatida xatolik:", error);
            return null;
        }
    };

    const fetchApartment = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Token yo'q!");
            setError("Tizimga kiring!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/adminka/get_house/${id}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`API xatolik qaytardi: ${response.status}`);
            }

            const result = await response.json();

            if (result.status && result.data) {
                setApartment(result.data);
                
                // Set initial images with proper error handling
                const availableImages = [
                    formatImageUrl(result.data.image1),
                    formatImageUrl(result.data.image2),
                    formatImageUrl(result.data.image3),
                    formatImageUrl(result.data.image4),
                    formatImageUrl(result.data.image5),
                ].filter(Boolean); // Filter out null values
                
                if (availableImages.length > 0) {
                    setLargeImage(availableImages[0]);
                    setSmallImages(availableImages);
                } else {
                    setLargeImage(DEFAULT_IMAGE);
                    setSmallImages([]);
                }
            } else {
                setError("Uy ma'lumotlari topilmadi!");
            }
        } catch (err) {
            console.error("Ma'lumotni yuklashda xatolik:", err);
            setError("Ma'lumotni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!apartment) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Tizimga kiring!");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/adminka/update_house_status/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error(`Statusni o'zgartirishda xatolik: ${response.status}`);
            }

            navigate('/elonlarRoyxati');
        } catch (error) {
            console.error("Status o'zgartirish xatoligi:", error);
            setError(error.message);
        }
    };

    // Function to handle hiding/showing the apartment
    const handleToggleVisibility = async () => {
        if (!apartment) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Tizimga kiring!");
            return;
        }

        setActionLoading(true);

        try {
            // Determine the new status (toggle current status)
            const newStatus = apartment.status_view !== false;

            // API endpoint for updating visibility
            const response = await fetch(
                `${API_BASE_URL}/api/v1/adminka/update-hide-homestatus/?house_id=${id}&status_home=${!newStatus}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );

            if (!response.ok) {
                // Response body'ni tekshirib ko'rish
                const errorText = await response.text();
                console.error("API error response:", errorText);
                throw new Error(`${newStatus ? 'Berkitishda' : 'Ochishda'} xatolik: ${response.status}`);
            }

            const result = await response.json();
            console.log(`${newStatus ? 'Berkitish' : 'Ochish'} natijasi:`, result);

            // Show success notification
            alert(newStatus ? "Muvaffaqiyatli berkitildi!" : "Muvaffaqiyatli ochildi!");

            // Update the apartment state with new status
            setApartment(prev => ({
                ...prev,
                status_view: !newStatus
            }));

            // Optionally refresh the data from server to ensure all fields are up to date
            fetchApartment();

            // navigate back to listing only if hiding (not when unhiding)
            if (newStatus) {
                navigate('/elonlarRoyxati');
            }
        } catch (error) {
            console.error("Visibility toggle error:", error);
            setError(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSmallImageClick = (clickedImage, index) => {
        if (!clickedImage) return;
        
        const newSmallImages = [...smallImages];
        const previousLargeImage = largeImage;

        setLargeImage(clickedImage);
        
        // Agar oldingi katta rasm DEFAULT_IMAGE bo'lsa, uni almashtirmaymiz
        if (previousLargeImage !== DEFAULT_IMAGE) {
            newSmallImages[index] = previousLargeImage;
            setSmallImages(newSmallImages);
        }
    };

    const handleProductClick = () => {
        navigate('/elonlarRoyxati');
    };

    const handleBackClick = () => {
        navigate('/elonlarRoyxati');
    };

    const handleLargeImageClick = () => {
        if (smallImages.length === 0) return;
        
        setIsModalOpen(true);
        setCurrentImageIndex(0);
    };

    const handleNextImage = () => {
        if (currentImageIndex < smallImages.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const handlePrevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Toggle edit mode
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    // Handle form submission success
    const handleEditSuccess = (updatedApartment) => {
        setApartment(updatedApartment);
        setIsEditing(false);
        // Refresh the data
        fetchApartment();
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin h-10 w-10 text-teal-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <span className="ml-3 text-lg font-medium text-gray-700">Ma'lumotlar yuklanmoqda...</span>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
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
                            fetchApartment();
                        }}
                        className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
                    >
                        Qayta urinish
                    </button>
                </div>
            </div>
        </div>
    );

    if (!apartment) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-6 rounded-lg bg-white shadow-md max-w-md">
                <p className="text-center text-gray-500">Uy topilmadi</p>
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => navigate('/elonlarRoyxati')}
                        className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
                    >
                        Orqaga qaytish
                    </button>
                </div>
            </div>
        </div>
    );

    const breadcrumbItems = [
        { name: 'Dashboard', path: 'elonlarRoyxati', onClick: handleProductClick },
        { name: 'Mahsulot', path: 'elonlarRoyxati', onClick: handleProductClick },
        { name: 'Mahsulot detallari', path: `elonlarRoyxati/apartment/${id}` },
    ];

    // Check if apartment is hidden to determine the button text and color
    const isHidden = apartment.status_view === false;
    const visibilityButtonText = isHidden ? "Ochish" : "Berkitish";
    const visibilityButtonColor = isHidden ? "green" : "gray";
    const visibilityButtonIcon = isHidden ? (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ) : (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );

    return (
        <div className="min-h-screen flex justify-center p-4">
            <div className="bg-gray-100 rounded-lg w-full p-[24px] md:p-[24px]">
                <h1 className="font-inter font-medium text-2xl leading-8 text-left">Mahsulot tafsilotlari</h1>

                {/* Breadcrumb and Buttons */}
                <div className="pb-4 md:pb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        {/* Breadcrumb */}
                        <div className="font-inter font-medium text-sm text-gray-500">
                            {breadcrumbItems.map((item, index) => (
                                <span key={item.name}>
                                    <span
                                        className={
                                            index < 2
                                                ? 'bg-gradient-to-r from-teal-500 to-lime-300 bg-clip-text text-transparent cursor-pointer'
                                                : 'text-gray-500'
                                        }
                                        onClick={item.onClick}
                                    >
                                        {item.name}
                                    </span>
                                    {index < breadcrumbItems.length - 1 && <span className="mx-2">›</span>}
                                </span>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                            {/* Add Edit button */}
                            <button
                                onClick={toggleEditMode}
                                className="flex items-center px-3 py-2 border border-blue-500 text-blue-500 font-inter font-medium text-sm h-10 w-full md:w-auto hover:bg-blue-50 transition-colors rounded-[8px]"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                {isEditing ? "Bekor qilish" : "Tahrirlash"}
                            </button>
                            
                            {/* Toggle Visibility Button */}
                            <button
                                onClick={handleToggleVisibility}
                                disabled={actionLoading}
                                className={`flex items-center px-3 py-2 border border-${visibilityButtonColor}-500 text-${visibilityButtonColor}-500 font-inter font-medium text-sm h-10 w-full md:w-auto hover:bg-${visibilityButtonColor}-50 transition-colors rounded-[8px]`}
                                style={{
                                    borderColor: isHidden ? '#10b981' : '#6b7280',
                                    color: isHidden ? '#10b981' : '#6b7280'
                                }}
                            >
                                {actionLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Jarayonda...</span>
                                    </>
                                ) : (
                                    <>
                                            {visibilityButtonIcon}
                                            {visibilityButtonText}
                                    </>
                                )}
                            </button>

                            <button
                                className="flex items-center px-3 py-2 border border-red-500 text-red-500 font-inter font-medium text-sm h-10 w-full md:w-auto hover:bg-gray-50 transition-colors rounded-[8px]"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                O'chirish
                            </button>
                            <button
                                className="flex items-center px-3 py-2 border border-yellow-500 text-yellow-500 font-inter font-medium text-sm h-10 w-full md:w-auto hover:bg-gray-50 transition-colors rounded-[8px]"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Goldga o'tkazish
                            </button>
                        </div>
                    </div>
                </div>

                {isEditing ? (
                    <EditApartmentForm 
                        apartment={apartment} 
                        id={id} 
                        onCancel={toggleEditMode} 
                        onSuccess={handleEditSuccess}
                    />
                ) : (
                    <>
                        {/* Image Gallery and Details */}
                        <div className="flex flex-col md:flex-row items-start mb-6 bg-white p-4 md:p-6 rounded-lg">
                            <div className="w-full md:w-1/2 lg:w-1/3">
                                <img
                                    src={largeImage || DEFAULT_IMAGE}
                                    alt="Large Room"
                                    className="w-full h-48 md:h-64 lg:h-72 object-cover rounded-md mb-2 cursor-pointer"
                                    onClick={handleLargeImageClick}
                                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    loading="lazy"
                                />
                                <div className="flex gap-2 overflow-x-auto">
                                    {smallImages.length > 0 ? (
                                        smallImages.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo || THUMBNAIL_IMAGE}
                                                alt={`Small Room ${index + 1}`}
                                                className="w-12 h-12 object-cover rounded-md cursor-pointer"
                                                onClick={() => handleSmallImageClick(photo, index)}
                                                onError={(e) => { e.target.src = THUMBNAIL_IMAGE; }}
                                                loading="lazy"
                                            />
                                        ))
                                    ) : (
                                        <div className="flex justify-center w-full">
                                            <span className="text-sm text-gray-500">Qo'shimcha rasmlar mavjud emas</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 lg:w-2/3 mt-4 md:mt-0 md:ml-6">
                                <div className="mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">{apartment.Adres || "Noma'lum manzil"}</h2>
                                    <div className="font-inter font-semibold text-[20px] leading-[24px] tracking-[0.5px] text-left pb-[20px]">
                                        {apartment.joylashuv || "Noma'lum joylashuv"}, {apartment.tuman || "Noma'lum tuman"}
                                    </div>

                                    <div className="font-inter font-semibold text-[28px] leading-[34px] tracking-normal text-left border-b pb-[20px]">
                                        ${apartment.narxi ? apartment.narxi.toLocaleString() : "Narxi mavjud emas"}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {/* Dynamic Key-Value Pairs */}
                                    {[
                                        { label: 'Kategoriya', value: apartment.category || "Noma'lum kategoriya" },
                                        { label: 'Kvartira', value: apartment.kvartl || "Noma'lum kvartira" },
                                        { label: 'Manzil', value: `${apartment.joylashuv || "Noma'lum joylashuv"}, ${apartment.tuman || "Noma'lum tuman"}` },
                                        { label: 'Narxi', value: `$${apartment.narxi ? apartment.narxi.toLocaleString() : "Narxi mavjud emas"}` },
                                        { label: 'Xonalar soni', value: apartment.xona_soni || "Noma'lum" },
                                        { label: 'Maydon', value: apartment.maydon ? `${apartment.maydon} m²` : "Noma'lum" },
                                        { label: 'Qavat', value: `${apartment.qavat || "Noma'lum"} / ${apartment.bino_qavati || "Noma'lum"}` },
                                        { label: 'Remont', value: apartment.remont || "Ma'lumot yo'q" },
                                            // Status with styled text based on visibility
                                            {
                                                label: 'Holati',
                                                value: (
                                                    <span style={{ color: isHidden ? '#ef4444' : '#10b981' }}>
                                                        {isHidden ? "Berkitilgan" : "Ko'rinadi"}
                                                    </span>
                                                )
                                            },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center border-b border-gray-200 py-2">
                                            <span className="font-semibold text-base text-gray-500">{label}</span>
                                            <span className="text-base text-gray-900">
                                                {typeof value === 'object' ? value : value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-6 bg-white p-4 md:p-6 rounded-lg">
                            <h4 className="font-medium mb-2 text-gray-700">Ta'rif</h4>
                            <p className="text-sm text-gray-500 border-t border-gray-300 pt-2 pb-4">
                                {apartment.description || "Ta'rif mavjud emas"}
                            </p>
                        </div>

                        {/* Modal for Large Image */}
                        {isModalOpen && smallImages.length > 0 && (
                            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                                {/* Image Container */}
                                <div className="relative">
                                    {/* Large Image */}
                                    <img
                                        src={smallImages[currentImageIndex] || DEFAULT_IMAGE}
                                        alt="Large view"
                                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    />

                                    {/* Prev Button (Left Side, Outside Image) */}
                                    <button
                                        onClick={handlePrevImage}
                                        disabled={currentImageIndex === 0}
                                        className="absolute left-[-60px] top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full shadow-md disabled:opacity-50 transition"
                                    >
                                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {/* Next Button (Right Side, Outside Image) */}
                                    <button
                                        onClick={handleNextImage}
                                        disabled={currentImageIndex === smallImages.length - 1}
                                        className="absolute right-[-60px] top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full shadow-md disabled:opacity-50 transition"
                                    >
                                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Close Button (Top Right, Outside Image) */}
                                    <button
                                        onClick={closeModal}
                                        className="absolute top-[-50px] right-[-50px] bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition"
                                    >
                                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ApartmentDetails;