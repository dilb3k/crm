import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ApartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApartment = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token yo‘q!");
                setError("Tizimga kiring!");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://167.99.245.227/api/v1/adminka/get_house/${id}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`API xatolik qaytardi: ${response.status}`);
                }

                const result = await response.json();

                if (result.status && result.data) {
                    setApartment(result.data);
                } else {
                    setError("Uy ma’lumotlari topilmadi!");
                }
            } catch (err) {
                setError("Ma'lumotni yuklashda xatolik yuz berdi");
            } finally {
                setLoading(false);
            }
        };

        fetchApartment();
    }, [id]);

    if (loading) return <p className="text-gray-500 text-center">Yuklanmoqda...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!apartment) return <p className="text-gray-500 text-center">Uy topilmadi</p>;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl mx-auto mt-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg"
            >
                ◀️ Ortga
            </button>

            <h2 className="text-2xl font-bold">{apartment.kvartl || "Noma’lum kvartira"}</h2>
            <p className="text-gray-700">
                Manzil: {apartment.joylashuv || "Noma’lum joylashuv"}, {apartment.tuman || "Noma’lum tuman"}
            </p>
            <p className="text-xl font-semibold text-blue-500">
                ${apartment.narxi ? apartment.narxi.toLocaleString() : "Narxi mavjud emas"}
            </p>
            <p className="text-gray-600">Xonalar soni: {apartment.xona_soni || "Noma’lum"}</p>
            <p className="text-gray-600">Maydon: {apartment.maydon ? `${apartment.maydon} m²` : "Noma’lum"}</p>
            <p className="text-gray-600">Qavat: {apartment.qavat || "Noma’lum"} / {apartment.bino_qavati || "Noma’lum"}</p>
            <p className="text-gray-600">Remont: {apartment.remont || "Ma'lumot yo‘q"}</p>

            {apartment.image1 && (
                <img 
                    src={`http://167.99.245.227/${apartment.image1}`} 
                    alt="apartment" 
                    className="w-full h-64 object-cover mt-4 rounded-lg"
                />
            )}
        </div>
    );
};

export default ApartmentDetails;
