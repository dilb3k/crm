import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Maklerlar = () => {
    const [maklers, setMaklers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMaklers = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token yo'q!");
                setError("Token topilmadi");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    "https://fast.uysavdo.com/api/v1/adminka/maklers",
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

                if (!data || !Array.isArray(data)) {
                    throw new Error("API noto'g'ri formatda ma'lumot qaytardi");
                }

                setMaklers(data);
            } catch (error) {
                console.error("Fetch xatolik berdi:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMaklers();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(2);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} - ${hours}:${minutes}`;
    };

    // Render star rating component
    const StarRating = ({ rating }) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <div className="flex items-center">
                <span className="mr-2 font-medium text-gray-700">{rating.toFixed(1)}</span>
                <div className="flex">
                    {[...Array(fullStars)].map((_, i) => (
                        <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                    {hasHalfStar && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <defs>
                                <linearGradient id="halfStarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="50%" stopColor="#F59E0B" />
                                    <stop offset="50%" stopColor="#D1D5DB" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#halfStarGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    )}
                    {[...Array(emptyStars)].map((_, i) => (
                        <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
            </div>
        );
    };

    // Handle row click to navigate to makler detail page
    const handleRowClick = (maklerId) => {
        navigate(`/makler/${maklerId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="font-Inter mb-6 text-2xl font-semibold text-gray-800">Maklerlar</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white border-b border-gray-200">
                            <th className="py-4 px-6 font-medium text-sm text-gray-500">Nomi</th>
                            <th className="py-4 px-6 font-medium text-sm text-gray-500">Telefon</th>
                            <th className="py-4 px-6 font-medium text-sm text-gray-500">Reyting</th>
                            <th className="py-4 px-6 font-medium text-sm text-gray-500">Ro'yxatdan o'tgan vaqti</th>
                            <th className="py-4 px-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {maklers.map((makler) => (
                            <tr 
                                key={makler.id} 
                                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleRowClick(makler.id)}
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`https://fast.uysavdo.com/uploads/${makler.photo}`}
                                            alt={makler.name}
                                            className="w-10 h-10 rounded-full object-cover shadow-sm"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                                        />
                                        <span className="font-medium text-gray-800">{makler.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-blue-600 font-medium">
                                    <a href={`tel:${makler.phone}`} onClick={(e) => e.stopPropagation()}>
                                        {makler.phone}
                                    </a>
                                </td>
                                <td className="py-4 px-6">
                                    <StarRating rating={makler.rating || 0} />
                                </td>
                                <td className="py-4 px-6 text-gray-600">{formatDate(makler.created_at)}</td>
                                <td className="py-4 px-6 text-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Maklerlar;