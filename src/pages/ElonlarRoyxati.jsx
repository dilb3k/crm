import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 3; // API dagi size bilan bir xil bo‘lishi kerak

const ElonlarRoyxati = () => {
    const [apartments, setApartments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApartments = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token yo‘q!");
                return;
            }

            try {
                const response = await fetch(
                    `http://167.99.245.227/api/v1/adminka/get_house/?page=${currentPage}&size=${PAGE_SIZE}`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                console.log(apartments);

                if (!response.ok) {
                    throw new Error(`API xatolik qaytardi: ${response.status}`);
                }

                const data = await response.json();

                if (!data || !Array.isArray(data.data)) {
                    throw new Error("API noto‘g‘ri formatda ma'lumot qaytardi");
                }

                setApartments(data.data);
                setTotalCount(data.count);
            } catch (error) {
                console.error("Fetch xatolik berdi:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchApartments();
    }, [currentPage]);

    const handleRowClick = (apartmentId) => {
        navigate(`/apartment/${apartmentId}`);
    };

    if (loading) return <div className="text-gray-500 text-center py-4">Loading...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Xatolik: {error}</div>;

    return (
        <div className="bg-gray-100 min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">E'lonlar ro‘yxati</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-200">
                        <tr className="border-b border-gray-300 text-left">
                            {[
                                "Rasm", "Tuman", "Kvartal", "Narxi", "Xonalar", "Maydon (m²)", "Sana"
                            ].map((header, index) => (
                                <th key={index} className="p-4 text-sm font-semibold text-gray-600">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {apartments.map((apartment) => (
                            <tr
                                key={apartment.id}
                                onClick={() => handleRowClick(apartment.id)}
                                className="hover:bg-gray-50 cursor-pointer border-b"
                            >
                                <td className="p-4">
                                    <img
                                        src={apartment.image1 ? `http://167.99.245.227/${apartment.image1}` : "https://via.placeholder.com/50"}
                                        alt="apartment"
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                </td>
                                <td className="p-4">{apartment.tuman || "Noma'lum"}</td>
                                <td className="p-4">{apartment.kvartl || "Noma'lum"}</td>
                                <td className="p-4 font-semibold">${apartment.narxi?.toLocaleString() || "Noma'lum"}</td>
                                <td className="p-4">{apartment.xona_soni || "Noma'lum"}</td>
                                <td className="p-4">{apartment.maydon || "Noma'lum"} m²</td>
                                <td className="p-4">{new Date(apartment.created_at).toLocaleDateString("uz-UZ") || "Noma'lum"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"}`}
                >
                    ⬅️ Oldingi
                </button>
                <span className="text-gray-700">
                    {currentPage} / {Math.ceil(totalCount / PAGE_SIZE)}
                </span>
                <button
                    disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage >= Math.ceil(totalCount / PAGE_SIZE) ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"}`}
                >
                    Keyingi ➡️
                </button>
            </div>
        </div>
    );
};

export default ElonlarRoyxati;