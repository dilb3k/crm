import React, { useState, useEffect } from "react";

const ElonlarRoyxati = () => {
    const [apartments, setApartments] = useState([]);
    const [goldApartments, setGoldApartments] = useState([]);
    const [hiddenApartments, setHiddenApartments] = useState([]);
    const [deletedApartments, setDeletedApartments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Barchasi");
    const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                const [apartmentsRes, goldRes, hiddenRes, deletedRes] = await Promise.all([
                    fetch("http://localhost:5000/apartments")
                        .then((res) => (res.ok ? res.json() : Promise.reject(`Failed to fetch apartments: ${res.status}`)))
                        .catch((err) => {
                            console.error("Apartments fetch error:", err);
                            return [];
                        }),
                    fetch("http://localhost:5000/goldApartments")
                        .then((res) => (res.ok ? res.json() : Promise.reject(`Failed to fetch goldApartments: ${res.status}`)))
                        .catch((err) => {
                            console.error("GoldApartments fetch error:", err);
                            return [];
                        }),
                    fetch("http://localhost:5000/hiddenApartments")
                        .then((res) => (res.ok ? res.json() : Promise.reject(`Failed to fetch hiddenApartments: ${res.status}`)))
                        .catch((err) => {
                            console.error("HiddenApartments fetch error:", err);
                            return [];
                        }),
                    fetch("http://localhost:5000/deletedApartments")
                        .then((res) => (res.ok ? res.json() : Promise.reject(`Failed to fetch deletedApartments: ${res.status}`)))
                        .catch((err) => {
                            console.error("DeletedApartments fetch error:", err);
                            return [];
                        }),
                ]);

                setApartments(apartmentsRes);
                setGoldApartments(goldRes);
                setHiddenApartments(hiddenRes);
                setDeletedApartments(deletedRes);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.toString());
            } finally {
                setLoading(false);
            }
        };

        fetchApartments();
    }, []);

    const handleStatusChange = async (apartmentId, newStatus) => {
        let apartment;
        if (activeTab === "Barchasi") {
            apartment = apartments.find((apt) => apt.id === apartmentId);
        } else if (activeTab === "Gold e'lonlar") {
            apartment = goldApartments.find((apt) => apt.id === apartmentId);
        } else if (activeTab === "Berkitilgan") {
            apartment = hiddenApartments.find((apt) => apt.id === apartmentId);
        } else if (activeTab === "O‘chirilgan") {
            apartment = deletedApartments.find((apt) => apt.id === apartmentId);
        }

        if (!apartment) return;

        const currentEndpoint = {
            Barchasi: "apartments",
            "Gold e'lonlar": "goldApartments",
            Berkitilgan: "hiddenApartments",
            "O‘chirilgan": "deletedApartments",
        }[activeTab];

        const targetEndpoint = {
            All: "apartments",
            Gold: "goldApartments",
            Berkitilgan: "hiddenApartments",
            "O'chirilgan": "deletedApartments",
        }[newStatus];

        if (currentEndpoint === targetEndpoint) {
            setDropdownOpenIndex(null);
            return;
        }

        try {
            const deleteResponse = await fetch(`http://localhost:5000/${currentEndpoint}/${apartmentId}`, {
                method: "DELETE",
            });
            if (!deleteResponse.ok) {
                throw new Error(`Failed to delete apartment from ${currentEndpoint}: ${deleteResponse.status}`);
            }

            const postResponse = await fetch(`http://localhost:5000/${targetEndpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...apartment, status: newStatus }),
            });
            if (!postResponse.ok) {
                throw new Error(`Failed to add apartment to ${targetEndpoint}: ${postResponse.status}`);
            }

            if (activeTab === "Barchasi") {
                setApartments((prev) => prev.filter((apt) => apt.id !== apartmentId));
            } else if (activeTab === "Gold e'lonlar") {
                setGoldApartments((prev) => prev.filter((apt) => apt.id !== apartmentId));
            } else if (activeTab === "Berkitilgan") {
                setHiddenApartments((prev) => prev.filter((apt) => apt.id !== apartmentId));
            } else if (activeTab === "O‘chirilgan") {
                setDeletedApartments((prev) => prev.filter((apt) => apt.id !== apartmentId));
            }

            if (newStatus === "All") {
                setApartments((prev) => [...prev, { ...apartment, status: newStatus }]);
            } else if (newStatus === "Gold") {
                setGoldApartments((prev) => [...prev, { ...apartment, status: newStatus }]);
            } else if (newStatus === "Berkitilgan") {
                setHiddenApartments((prev) => [...prev, { ...apartment, status: newStatus }]);
            } else if (newStatus === "O'chirilgan") {
                setDeletedApartments((prev) => [...prev, { ...apartment, status: newStatus }]);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            setError(error.toString());
        } finally {
            setDropdownOpenIndex(null);
        }
    };

    const displayedApartments = () => {
        if (activeTab === "Barchasi") return apartments;
        if (activeTab === "Gold e'lonlar") return goldApartments;
        if (activeTab === "Berkitilgan") return hiddenApartments;
        if (activeTab === "O‘chirilgan") return deletedApartments;
        return [];
    };

    if (loading) {
        return <div className="text-gray-500">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen pl-[16px] pb-[16px]">
            {/* Header */}
            <div className="mt-[16px] h-[34px] flex items-center">
                <h1 className="font-inter font-medium text-[28px] leading-[34px] text-gray-900">
                    E'lonlar ro‘yxati
                </h1>
            </div>

            {/* Navigation Tabs with Gradient Text */}
            <div className="mt-[16px] h-[34px] flex items-center bg-gray-100 border-b border-gray-300 relative">
                <nav className="flex space-x-[24px] w-full">
                    {["Barchasi", "Gold e'lonlar", "Berkitilgan", "O‘chirilgan"].map(
                        (item, index) => (
                            <span
                                key={index}
                                onClick={() => setActiveTab(item)}
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
            <div className="mt-[16px] bg-white rounded-lg shadow">
                <table className="w-full border-collapse">
                    <thead className="bg-white">
                        <tr className="border-b border-gray-300">
                            {[
                                "Rasm va Manzil",
                                "Nomi",
                                "Uy narxi",
                                "Xonalar",
                                "Qurilgan yili",
                                "Maydoni",
                                "Yuklangan sana",
                            ].map((header, index) => (
                                <th
                                    key={index}
                                    className="p-[16px] text-left text-[12px] font-semibold font-inter leading-[15.84px] tracking-[0.5%] bg-white text-[#858D9D]"
                                >
                                    {header}
                                </th>
                            ))}
                            <th className="p-[16px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedApartments().map((apartment, index) => (
                            <tr key={apartment.id}>
                                {/* Rasm va Manzil side by side */}
                                <td className="p-[16px] flex items-center">
                                    <img
                                        src={
                                            apartment.image.startsWith("file:///") ||
                                                !apartment.image.includes("http")
                                                ? "https://via.placeholder.com/40"
                                                : apartment.image
                                        }
                                        alt="apartment"
                                        className="w-[40px] h-[40px] rounded-none mr-[8px]"
                                    />
                                    <span
                                        className="text-gray-900 font-inter"
                                        style={{
                                            maxWidth: "143px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {apartment.Adres}
                                    </span>
                                </td>

                                {/* Nomi */}
                                <td className="p-[16px]">{apartment.category}</td>

                                {/* Uy Narxi */}
                                <td className="p-[16px]">${apartment.price.toLocaleString()}</td>

                                {/* Xonalar */}
                                <td className="p-[16px]">{apartment.rooms}</td>

                                {/* Qurilgan Yili */}
                                <td className="p-[16px]">{apartment.year}</td>

                                {/* Maydoni */}
                                <td className="p-[16px]">{apartment.area}</td>

                                {/* Yuklangan Sana */}
                                <td className="p-[16px]">{apartment.time}</td>

                                {/* Dropdown Menu */}
                                <td className="p-[16px] text-center relative">
                                    <button
                                        onClick={() =>
                                            setDropdownOpenIndex(
                                                dropdownOpenIndex === index ? null : index
                                            )
                                        }
                                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                                    >
                                        ...
                                    </button>
                                    {dropdownOpenIndex === index && (
                                        <div className="absolute right-4 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                            <ul className="py-2">
                                                <li
                                                    onClick={() => handleStatusChange(apartment.id, "Gold")}
                                                    className="px-4 py-2 text-sm font-inter flex items-center hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <img
                                                        src="https://i.imgur.com/ol5HI0W.jpeg"
                                                        alt="Gold icon"
                                                        className="w-5 h-5 mr-2"
                                                    />
                                                    <span className="text-yellow-500">Goldga o'tkazish</span>
                                                </li>
                                                <li
                                                    onClick={() => handleStatusChange(apartment.id, "Berkitilgan")}
                                                    className="px-4 py-2 text-sm font-inter flex items-center hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <img
                                                        src="https://i.imgur.com/V5YYWeQ.jpeg"
                                                        alt="Pin icon"
                                                        className="w-5 h-5 mr-2"
                                                    />
                                                    <span className="text-gray-500">Berkitish</span>
                                                </li>
                                                <li
                                                    onClick={() => handleStatusChange(apartment.id, "O'chirilgan")}
                                                    className="px-4 py-2 text-sm font-inter flex items-center hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <img
                                                        src="https://i.imgur.com/MWaj9bJ.png"
                                                        alt="Delete icon"
                                                        className="w-5 h-5 mr-2"
                                                    />
                                                    <span className="text-red-500">O'chirish</span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ElonlarRoyxati;