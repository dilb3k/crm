import React, { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";

const ApartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [largeImage, setLargeImage] = useState(null); // Added
    const [smallImages, setSmallImages] = useState([]); // Added
    const [isModalOpen, setIsModalOpen] = useState(false); // Added
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Added

    useEffect(() => {
        const fetchApartment = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token yo'q!");
                setError("Tizimga kiring!");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`https://fast.uysavdo.com/api/v1/adminka/get_house/${id}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`API xatolik qaytardi: ${response.status}`);
                }

                const result = await response.json();

                if (result.status && result.data) {
                    setApartment(result.data);
                    // Set initial images
                    if (result.data.image1) {
                        // Fix: Remove home_images/ prefix from image paths
                        setLargeImage(`https://fast.uysavdo.com/uploads/${result.data.image1.replace('home_images/', '')}`);
                        setSmallImages([
                            result.data.image1 ? `https://fast.uysavdo.com/uploads/${result.data.image1.replace('home_images/', '')}` : null,
                            result.data.image2 ? `https://fast.uysavdo.com/uploads/${result.data.image2.replace('home_images/', '')}` : null,
                            result.data.image3 ? `https://fast.uysavdo.com/uploads/${result.data.image3.replace('home_images/', '')}` : null,
                        ].filter(Boolean)); // Filter out undefined/null values
                    }
                } else {
                    setError("Uy ma'lumotlari topilmadi!");
                }
            } catch (err) {
                setError("Ma'lumotni yuklashda xatolik yuz berdi");
            } finally {
                setLoading(false);
            }
        };

        fetchApartment();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        if (!apartment) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Tizimga kiring!");
            return;
        }

        try {
            const response = await fetch(`https://fast.uysavdo.com/api/v1/adminka/update_house_status/${id}`, {
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
            setError(error.message);
        }
    };

    const handleSmallImageClick = (clickedImage, index) => {
        const newSmallImages = [...smallImages];
        const previousLargeImage = largeImage;

        setLargeImage(clickedImage);
        newSmallImages[index] = previousLargeImage;
        setSmallImages(newSmallImages);
    };

    const handleProductClick = () => {
        navigate('/elonlarRoyxati');
    };

    const handleBackClick = () => {
        navigate('/elonlarRoyxati');
    };

    const handleLargeImageClick = () => {
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

    if (loading) return <div className="text-gray-500">Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;
    if (!apartment) return <div className="text-gray-500">Apartment not found</div>;

    const breadcrumbItems = [
        { name: 'Dashboard', path: 'elonlarRoyxati', onClick: handleProductClick },
        { name: 'Mahsulot', path: 'elonlarRoyxati', onClick: handleProductClick },
        { name: 'Mahsulot detallari', path: `elonlarRoyxati/apartment/${id}` },
    ];

    return (
        <div className="min-h-screen flex justify-center p-4">
            <div className="bg-gray-100 rounded-lg w-full w-full p-[24px] md:p-[24px]">
                <h1 className="font-inter font-medium text-2xl leading-8 text-left ">Mahsulot tafsilotlari</h1>

                {/* Back Button */}

                {/* Breadcrumb and Buttons */}
                <div className="pb-4 md:pb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between ">
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
                            <button
                                className="flex items-center px-3 py-2 border border-gray-500 text-gray-500 font-inter font-medium text-sm h-10 w-full md:w-auto hover:bg-gray-50 transition-colors rounded-[8px]"
                            >
                                <img src="https://i.imgur.com/V5YYWeQ.jpeg" alt="Pin icon" className="w-4 h-4 mr-1" />
                                Berkitish
                            </button>
                            <button
                                className="flex items-center px-3 py-2 border border-red-500 text-red-500 font-inter font-medium text-sm h-10 w-full md:w-auto hover:bg-gray-50 transition-colors rounded-[8px]"
                            >
                                <img src="https://i.imgur.com/MWaj9bJ.png" alt="Delete icon" className="w-4 h-4 mr-1" />
                                O'chirish
                            </button>
                            <button
                                className="flex items-center px-3 py-2 border border-yellow-500 text-yellow-500 font-inter font-medium text-sm h-10 w-full md:w-auto hover:bg-gray-50 transition-colors rounded-[8px]"
                            >
                                <img src="https://i.imgur.com/ol5HI0W.jpeg" alt="Gold icon" className="w-4 h-4 mr-1" />
                                Goldga o'tkazish
                            </button>
                        </div>
                    </div>
                </div>
                {/* Image Gallery and Details */}
                <div className="flex flex-col md:flex-row items-start mb-6 bg-white p-4 md:p-6 rounded-lg">

                    <div className="w-full md:w-1/2 lg:w-1/3">
                        {largeImage ? (
                            <img
                                src={largeImage}
                                alt="Large Room"
                                className="w-full h-48 md:h-64 lg:h-72 object-cover rounded-md mb-2 cursor-pointer"
                                onClick={handleLargeImageClick}
                            />
                        ) : (
                            <img
                                src="https://via.placeholder.com/216"
                                alt="Placeholder"
                                className="w-full h-48 md:h-64 lg:h-72 object-cover rounded-md mb-2 cursor-pointer"
                                onClick={handleLargeImageClick}
                            />
                        )}
                        <div className="flex gap-2 overflow-x-auto">
                            {smallImages.map((photo, index) => (
                                <img
                                    key={index}
                                    src={photo}
                                    alt={`Small Room ${index + 1}`}
                                    className="w-12 h-12 object-cover rounded-md cursor-pointer"
                                    onClick={() => handleSmallImageClick(photo, index)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 lg:w-2/3 mt-4 md:mt-0 md:ml-6">
                        <div className="mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">{apartment.Adres}</h2>
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
                                { label: 'Kvartira', value: apartment.kvartl || "Noma'lum kvartira" },
                                { label: 'Manzil', value: `${apartment.joylashuv || "Noma'lum joylashuv"}, ${apartment.tuman || "Noma'lum tuman"}` },
                                { label: 'Narxi', value: `$${apartment.narxi ? apartment.narxi.toLocaleString() : "Narxi mavjud emas"}` },
                                { label: 'Xonalar soni', value: apartment.xona_soni || "Noma'lum" },
                                { label: 'Maydon', value: apartment.maydon ? `${apartment.maydon} m²` : "Noma'lum" },
                                { label: 'Qavat', value: `${apartment.qavat || "Noma'lum"} / ${apartment.bino_qavati || "Noma'lum"}` },
                                { label: 'Remont', value: apartment.remont || "Ma'lumot yo'q" },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center border-b border-gray-200 py-2">
                                    <span className="font-semibold text-base text-gray-500">{label}</span>
                                    <span className="text-base text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal for Large Image */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                        {/* Image Container */}
                        <div className="relative">
                            {/* Large Image */}
                            <img
                                src={smallImages[currentImageIndex]}
                                alt="Large view"
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
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

                {/* Description */}
                <div className="mt-6 bg-white p-4 md:p-6 rounded-lg">
                    <h4 className="font-medium mb-2 text-gray-700">Description</h4>
                    <p className="text-sm text-gray-500 border-t border-gray-300 pt-2 pb-4">
                        {apartment.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApartmentDetails;