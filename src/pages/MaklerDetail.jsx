import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MaklerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [makler, setMakler] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaklerDetail = async () => {
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

                const foundMakler = data.find(m => m.id === parseInt(id));
                
                if (foundMakler) {
                    setMakler(foundMakler);
                } else {
                    setError("Makler topilmadi");
                }
            } catch (error) {
                console.error("Fetch xatolik berdi:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMaklerDetail();
    }, [id]);

    const handleGoBack = () => {
        navigate(-1);
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
                    <button 
                        onClick={handleGoBack}
                        className="mt-6 w-full py-3 rounded-md text-white font-medium"
                        style={{
                            background: "linear-gradient(90deg, #0AA3A1 0%, #B4C29E 100%)"
                        }}
                    >
                        Orqaga qaytish
                    </button>
                </div>
            </div>
        );
    }

    if (!makler) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-6 rounded-lg bg-white shadow-md max-w-md w-full">
                    <div className="flex items-center justify-center text-gray-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Makler topilmadi</h3>
                    <p className="text-gray-600 text-center">So'ralgan ma'lumotlar mavjud emas</p>
                    <button 
                        onClick={handleGoBack}
                        className="mt-6 w-full py-3 rounded-md text-white font-medium"
                        style={{
                            background: "linear-gradient(90deg, #0AA3A1 0%, #B4C29E 100%)"
                        }}
                    >
                        Orqaga qaytish
                    </button>
                </div>
            </div>
        );
    }

    // Format the bio text with line breaks
    const formatBioText = (text) => {
        return text.split('\n').map((line, index) => (
            <p key={index} className="mb-2 text-gray-700">{line}</p>
        ));
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Header with back button */}
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                <button 
                    onClick={handleGoBack}
                    className="flex items-center text-gray-700 hover:text-teal-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
            </div>

            {/* Makler profile section */}
            <div className="max-w-2xl mx-auto px-4 pt-10">
                {/* Profile Image */}
                <div className="flex justify-center -mt-6 mb-6 relative">
                    <div className="w-64 h-64 bg-white rounded-lg p-2 shadow-lg">
                        <img
                            src={makler.photo ? `https://fast.uysavdo.com/uploads/${makler.photo}` : "https://via.placeholder.com/300"}
                            alt={makler.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/300"; }}
                        />
                    </div>
                </div>

                {/* Profile Info Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                    {/* Name */}
                    <div className="border-b border-gray-100 p-5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Ism</span>
                            <span className="text-right font-semibold text-xl text-gray-800">{makler.name}</span>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="border-b border-gray-100 p-5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Tajriba</span>
                            <span className="text-right font-semibold text-gray-800">{makler.expiriense} yil</span>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="border-b border-gray-100 p-5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Reyting</span>
                            <div className="flex items-center">
                                <span className="text-right font-semibold text-gray-800">{makler.rating ? makler.rating.toFixed(1) : "0.0"}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="p-5">
                        <div className="mb-3">
                            <span className="text-gray-500 font-medium">Izoh</span>
                        </div>
                        <div className="mt-2 text-gray-700">
                            {formatBioText(makler.bio || "")}
                        </div>
                    </div>
                </div>

                {/* Call Button */}
                <div className="w-full">
                    <a 
                        href={`tel:${makler.phone}`}
                        className="block w-full py-4 text-center text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
                        style={{
                            background: "linear-gradient(90deg, #0AA3A1 0%, #B4C29E 100%)"
                        }}
                    >
                        <span className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Qo'ng'iroq qilish
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MaklerDetail;