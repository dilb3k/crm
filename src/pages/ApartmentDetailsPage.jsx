import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ApartmentDetails = () => {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApartment = async () => {
      const token = localStorage.getItem("token");
      const endpoints = ["apartments", "goldApartments", "hiddenApartments", "deletedApartments"];

      try {
        for (const endpoint of endpoints) {
          const response = await fetch(`http://167.99.245.227/api/v1/${endpoint}/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (response.ok) {
            const result = await response.json();
            if (result.status && result.data.length > 0) {
              setApartment(result.data[0]);
              break;
            }
          }
        }
        setLoading(false);
      } catch (err) {
        setError("Ma'lumotni yuklashda xatolik yuz berdi");
        setLoading(false);
      }
    };

    fetchApartment();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://167.99.245.227/api/v1/apartments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        alert("Holat muvaffaqiyatli o'zgartirildi");
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (err) {
      alert("Server bilan aloqa yo'q");
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p>{error}</p>;
  if (!apartment) return <p>Ma'lumot topilmadi</p>;

  return (
    <div>
      <h2>{apartment.name}</h2>
      <p>Manzil: {apartment.address}</p>
      <p>Narxi: {apartment.price} so'm</p>
      <button onClick={() => handleStatusChange("hidden")}>Yashirish</button>
      <button onClick={() => handleStatusChange("gold")}>Gold Apartamentga qo'shish</button>
    </div>
  );
};

export default ApartmentDetails;
