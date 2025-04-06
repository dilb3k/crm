import React, { useState, useRef,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Compressor from 'compressorjs';

const API_BASE_URL = "https://fast.uysavdo.com";

const AddApartment = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [token, setToken] = useState("");
    const fileInputRef = useRef(null);

    // Check for token on component mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        } else {
            setErrorMessage("Iltimos, tizimga kirish uchun login qiling");
        }
    }, []);

    // Form data state
    const [formData, setFormData] = useState({
        category: "noturarjoy", // Default value
        tuman: "",
        kvartl: "",
        joylashuv: "",
        maydon: "",
        xona_soni: "",
        qavat: "",
        bino_qavati: "",
        remont: "Evro", // Default value
        narxi: "",
        longitude: "",
        latitude: "",
        description: "",
        status_view: true,
        status_arenda: false,
        status_gold: false
    });

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Image compression function
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality: 0.6,
                maxWidth: 1200,
                maxHeight: 1200,
                success(result) {
                    resolve(result);
                },
                error(err) {
                    reject(err);
                },
            });
        });
    };

    // Handle image selection
    const handleImageChange = async (e) => {
        try {
            const files = Array.from(e.target.files);

            // Limit to 5 images
            if (selectedImages.length + files.length > 5) {
                setErrorMessage("Maksimum 5 ta rasm yuklash mumkin");
                return;
            }

            setErrorMessage("");
            setSuccessMessage("Rasmlar tayyorlanmoqda...");

            const newImages = [];
            const newPreviewUrls = [];

            for (const file of files) {
                // Check file size before compression
                if (file.size > 10 * 1024 * 1024) {
                    setErrorMessage("Rasm hajmi juda katta (>10MB). Kichikroq rasmni tanlang");
                    continue;
                }

                // Compress the image
                const compressedFile = await compressImage(file);
                console.log("Compressed image:", compressedFile);

                // Create preview URL
                const previewUrl = URL.createObjectURL(compressedFile);

                newImages.push(compressedFile);
                newPreviewUrls.push(previewUrl);
            }

            setSelectedImages(prev => [...prev, ...newImages]);
            setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
            setSuccessMessage("Rasmlar muvaffaqiyatli tayyorlandi");

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            console.error("Image processing error:", error);
            setErrorMessage(`Rasm tayyorlashda xatolik: ${error.message}`);
            setSuccessMessage("");
        }
    };

    // Remove image
    const removeImage = (index) => {
        // Remove from all arrays
        setSelectedImages(prev => prev.filter((_, i) => i !== index));

        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Submit form data with images
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        // Check if token exists
        if (!token) {
            setErrorMessage("Iltimos, tizimga kirish uchun login qiling");
            setIsSubmitting(false);
            return;
        }

        try {
            // Create FormData for submission
            const formDataToSend = new FormData();

            // Add all the form fields
            formDataToSend.append('category', formData.category);
            formDataToSend.append('tuman', formData.tuman);
            formDataToSend.append('kvartl', formData.kvartl || '');
            formDataToSend.append('joylashuv', formData.joylashuv);
            formDataToSend.append('maydon', Number(formData.maydon) || 0);
            formDataToSend.append('xona_soni', Number(formData.xona_soni) || 0);
            formDataToSend.append('qavat', formData.qavat ? Number(formData.qavat) : '');
            formDataToSend.append('bino_qavati', formData.bino_qavati ? Number(formData.bino_qavati) : '');
            formDataToSend.append('remont', formData.remont || '');
            formDataToSend.append('narxi', Number(formData.narxi) || 0);
            formDataToSend.append('longitude', formData.longitude ? Number(formData.longitude) : '');
            formDataToSend.append('latitude', formData.latitude ? Number(formData.latitude) : '');
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('status_view', formData.status_view);
            formDataToSend.append('status_arenda', formData.status_arenda);
            formDataToSend.append('status_gold', formData.status_gold);

            // Add the images to the FormData - IMPORTANT: use the same name multiple times
            for (const image of selectedImages) {
                formDataToSend.append('images', image);
            }

            // Make sure there's at least one image
            if (selectedImages.length === 0) {
                setErrorMessage("Kamida 1 ta rasm yuklash kerak");
                setIsSubmitting(false);
                return;
            }

            console.log("Submitting to add_house with images");

            // Submit everything to add_house endpoint
            const response = await fetch(`${API_BASE_URL}/api/v1/adminka/add_house/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API error response:", errorText);

                throw new Error(`API xatolik: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("API response:", data);

            // Success
            setSuccessMessage("E'lon muvaffaqiyatli qo'shildi!");

            // Reset form after successful submission
            setFormData({
                category: "noturarjoy",
                tuman: "",
                kvartl: "",
                joylashuv: "",
                maydon: "",
                xona_soni: "",
                qavat: "",
                bino_qavati: "",
                remont: "Evro",
                narxi: "",
                longitude: "",
                latitude: "",
                description: "",
                status_view: true,
                status_arenda: false,
                status_gold: false
            });
            setSelectedImages([]);
            setImagePreviewUrls([]);

        } catch (error) {
            console.error(`Xatolik: ${error.message}`);
            setErrorMessage(`Xatolik: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // If no token, show a warning
    if (!token) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">
                        Tizimga kirish kerak
                    </h2>
                    <p className="text-gray-700 mb-4">
                        E'lon qo'shish uchun iltimos tizimga kiring
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen px-4 pb-10">
            {/* Header */}
            <div className="mt-4 pt-4 flex items-center justify-between">
                <h1 className="font-inter font-medium text-2xl leading-8 text-gray-900">
                    Yangi e'lon qo'shish
                </h1>

                <div className="relative">
                    <button
                        className="bg-gradient-to-r from-teal-500 to-green-400 text-white px-6 py-2 rounded-lg font-medium flex items-center"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <span className="mr-2">E'lon qo'shish</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20">
                            <div className="py-1">
                                <button
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        setFormData(prev => ({ ...prev, status_gold: false }));
                                    }}
                                >
                                    Oddiy e'lon
                                </button>
                                <button
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        setFormData(prev => ({ ...prev, status_gold: true }));
                                    }}
                                >
                                    Gold e'lon
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form */}
            <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
                {successMessage && (
                    <div className="p-3 bg-green-100 text-green-700 border-b">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="p-3 bg-red-100 text-red-700 border-b">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategoriya
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            >
                                <option value="">Tanlang</option>
                                <option value="kvartira">Kvartira</option>
                                <option value="uchastka">Uchastka</option>
                                <option value="penhouse">Penhause</option>
                                <option value="noturarjoy">NoturarJoy</option>
                                <option value="yangiqurilish">Yangiqurilish</option>
                            </select>
                        </div>

                        {/* Tuman */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tuman
                            </label>
                            <input
                                type="text"
                                name="tuman"
                                value={formData.tuman}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* Kvartl */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kvartal
                            </label>
                            <input
                                type="text"
                                name="kvartl"
                                value={formData.kvartl}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        {/* Joylashuv */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Joylashuv
                            </label>
                            <input
                                type="text"
                                name="joylashuv"
                                value={formData.joylashuv}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* Maydon */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maydon (m²)
                            </label>
                            <input
                                type="number"
                                name="maydon"
                                value={formData.maydon}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* Xona soni */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Xonalar soni
                            </label>
                            <input
                                type="number"
                                name="xona_soni"
                                value={formData.xona_soni}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* Qavat */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Qavat
                            </label>
                            <input
                                type="number"
                                name="qavat"
                                value={formData.qavat}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        {/* Bino qavati */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bino qavati
                            </label>
                            <input
                                type="number"
                                name="bino_qavati"
                                value={formData.bino_qavati}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        {/* Remont */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remont turi
                            </label>
                            <select
                                name="remont"
                                value={formData.remont}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">Tanlang</option>
                                <option value="Evro">Evro</option>
                                <option value="O'rtacha">O'rtacha</option>
                                <option value="Ta'mirsiz">Ta'mirsiz</option>
                            </select>
                        </div>

                        {/* Narxi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Narxi ($)
                            </label>
                            <input
                                type="number"
                                name="narxi"
                                value={formData.narxi}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* Coordinates */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude
                            </label>
                            <input
                                type="number"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude
                            </label>
                            <input
                                type="number"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tavsif
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        ></textarea>
                    </div>

                    {/* Checkboxes */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="status_view"
                                name="status_view"
                                checked={formData.status_view}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor="status_view" className="ml-2 block text-sm text-gray-700">
                                Ko'rinishi
                            </label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Rasmlar (Max: 5)
                            </label>
                            <span className="text-sm text-gray-500">
                                {selectedImages.length}/5 ta rasm
                            </span>
                        </div>

                        {/* Image Previews */}
                        {imagePreviewUrls.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {imagePreviewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="h-24 w-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ×
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                            Rasm {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add image button - only show if less than 5 images */}
                        {selectedImages.length < 5 && (
                            <div className="mt-2">
                                <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:border-teal-400">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/jpeg,image/png,image/gif"
                                        className="hidden"
                                        multiple={selectedImages.length < 4}
                                    />
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                            Rasm qo'shish
                                        </span>
                                        <span className="mt-1 block text-xs text-gray-500">
                                            Max 5MB
                                        </span>
                                    </div>
                                </label>
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                            Har bir rasm 5MB dan kichik bo'lishi kerak. Maksimal 5 ta rasm.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/elonlar")}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg mr-4 hover:bg-gray-300 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 bg-gradient-to-r from-teal-500 to-green-400 text-white rounded-lg hover:from-teal-600 hover:to-green-500 transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saqlanmoqda...
                                </div>
                            ) : (
                                'Saqlash'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddApartment;