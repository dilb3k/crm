import React, { useState, useEffect } from "react";
import Compressor from 'compressorjs';

const EditApartmentForm = ({ apartment, id, onCancel, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        category: "",
        tuman: "",
        kvartl: "",
        joylashuv: "",
        maydon: "",
        xona_soni: "",
        qavat: "",
        bino_qavati: "",
        remont: "",
        narxi: "",
        longitude: "",
        latitude: "",
        description: "",
        images: []
    });

    // Initialize form data when apartment data is available
    useEffect(() => {
        if (apartment) {
            setFormData({
                category: apartment.category || "",
                tuman: apartment.tuman || "",
                kvartl: apartment.kvartl || "",
                joylashuv: apartment.joylashuv || "",
                maydon: apartment.maydon || "",
                xona_soni: apartment.xona_soni || "",
                qavat: apartment.qavat || "",
                bino_qavati: apartment.bino_qavati || "",
                remont: apartment.remont || "",
                narxi: apartment.narxi || "",
                longitude: apartment.longitude || "",
                latitude: apartment.latitude || "",
                description: apartment.description || "",
                images: []
            });
        }
    }, [apartment]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            // Only take the first 5 files (API limit)
            const fileList = Array.from(files).slice(0, 5);

            // Only take small images (<3MB)
            const filteredFiles = fileList.filter(file => file.size < 3 * 1024 * 1024);

            if (filteredFiles.length < fileList.length) {
                alert("Ba'zi rasmlar hajmi juda katta (>3MB). Ular o'chirildi.");
            }

            setFormData(prev => ({
                ...prev,
                images: filteredFiles
            }));
        } else if (type === 'number') {
            // Convert number inputs to numbers
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? '' : Number(value)
            }));
        } else {
            // Handle text inputs
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Image compression function with stronger compression
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality: 0.4, // Decreased quality from 0.6 to 0.4
                maxWidth: 800, // Decreased max width from 1200 to 800
                maxHeight: 800, // Decreased max height from 1200 to 800
                convertSize: 1000000, // Force compression for files larger than 1MB
                success(result) {
                    resolve(result);
                },
                error(err) {
                    reject(err);
                },
            });
        });
    };

    // Handle form submission with PATCH method
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Tizimga kiring!");
            setLoading(false);
            return;
        }

        try {
            // Create FormData for the body
            const formDataToSend = new FormData();

            // Add query parameters for other fields
            const queryParams = new URLSearchParams();
            queryParams.append('category', formData.category || '');
            queryParams.append('tuman', formData.tuman || '');
            queryParams.append('kvartl', formData.kvartl || '');
            queryParams.append('joylashuv', formData.joylashuv || '');
            queryParams.append('maydon', formData.maydon || '');
            queryParams.append('xona_soni', formData.xona_soni || '');
            queryParams.append('qavat', formData.qavat || '');
            queryParams.append('bino_qavati', formData.bino_qavati || '');
            queryParams.append('remont', formData.remont || '');
            queryParams.append('narxi', formData.narxi || '');
            queryParams.append('longitude', formData.longitude || '');
            queryParams.append('latitude', formData.latitude || '');
            queryParams.append('description', formData.description || '');

            // Process images if any
            if (formData.images && formData.images.length > 0) {
                try {
                    // Limit to 5 images
                    const limitedImages = formData.images.slice(0, 5);

                    // Compress all images
                    const compressedImages = await Promise.all(
                        limitedImages.map(file => compressImage(file))
                    );

                    // Add all images to the 'images' field - backend expects this field as File array
                    compressedImages.forEach(image => {
                        if (image && image.size <= 1 * 1024 * 1024) {
                            formDataToSend.append('images', image);
                        } else {
                            throw new Error(`Rasm juda katta. Maksimal hajm 1MB.`);
                        }
                    });
                } catch (error) {
                    setError(error.message);
                    setLoading(false);
                    return;
                }
            } else {
                // Backend requires at least one image
                formDataToSend.append('images', new File([], 'empty.jpg', { type: 'image/jpeg' }));
            }

            // Build the URL with query parameters
            const url = `https://fast.uysavdo.com/api/v1/adminka/update_ads/${id}?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formDataToSend
            });

            // Handle response
            if (!response.ok) {
                let errorMessage = `Tahrirlashda xatolik: ${response.status}`;

                try {
                    // Try to parse the error response
                    const errorText = await response.text();
                    console.error("Server error response text:", errorText);

                    // If it's JSON, try to extract a more specific message
                    if (errorText.trim().startsWith('{')) {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.detail && Array.isArray(errorJson.detail)) {
                            errorMessage = errorJson.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('; ');
                        } else if (errorJson.message) {
                            errorMessage = errorJson.message;
                        } else if (errorJson.detail) {
                            errorMessage = errorJson.detail;
                        }
                    }
                } catch (e) {
                    // If we can't parse the response, just use the status code
                    console.error("Error parsing error response:", e);
                }

                // If it's a CORS error or a 500 error, provide a specific message
                if (response.status === 0) {
                    errorMessage = "CORS xatosi: Server so'rovga ruxsat bermadi. Administratorga murojaat qiling.";
                } else if (response.status === 500) {
                    errorMessage = "Server xatosi (500): Server ichki xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.";
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (result.status) {
                // Call the success callback with updated data
                onSuccess(result.data);
                // Show success message
                alert("Muvaffaqiyatli tahrirlandi!");
            } else {
                throw new Error(result.message || "Tahrirlashda xatolik yuz berdi");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Tahrirlash</h3>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tuman</label>
                        <input
                            type="text"
                            name="tuman"
                            value={formData.tuman}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kvartl/Mavze</label>
                        <input
                            type="text"
                            name="kvartl"
                            value={formData.kvartl}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Joylashuv</label>
                        <input
                            type="text"
                            name="joylashuv"
                            value={formData.joylashuv}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maydon (m²)</label>
                        <input
                            type="number"
                            name="maydon"
                            value={formData.maydon}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xonalar soni</label>
                        <input
                            type="number"
                            name="xona_soni"
                            value={formData.xona_soni}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qavat</label>
                        <input
                            type="number"
                            name="qavat"
                            value={formData.qavat}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bino qavati</label>
                        <input
                            type="number"
                            name="bino_qavati"
                            value={formData.bino_qavati}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remont</label>
                        <select
                            name="remont"
                            value={formData.remont}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        >
                            <option value="">Tanlang</option>
                            <option value="Evro">Evro</option>
                            <option value="O'rtacha">O'rtacha</option>
                            <option value="Ta'mirsiz">Ta'mirsiz</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Narxi ($)</label>
                        <input
                            type="number"
                            name="narxi"
                            value={formData.narxi}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                            type="number"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                            type="number"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ta'rif</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    ></textarea>
                </div>

                {/* Replace your current file input with this code */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rasmlar</label>

                    <div className="relative">
                        {/* Hidden original file input that still handles the functionality */}
                        <input
                            type="file"
                            name="images"
                            onChange={handleInputChange}
                            multiple
                            accept="image/jpeg,image/png,image/gif"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            aria-label="Rasmlarni tanlash"
                        />

                        {/* Custom styled button that visually replaces the file input - now styled like other inputs */}
                        <div className="flex items-center px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer">
                            <span className="text-sm">Rasmlarni tanlash</span>
                            <span className="text-gray-400 text-sm ml-auto">Выбрать файлы</span>
                        </div>
                    </div>

                    {/* File name display area - shows when files are selected */}
                    {formData.images.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 text-gray-600 text-sm rounded-md border border-dashed border-gray-300">
                            <p className="font-medium">{formData.images.length} ta fayl tanlandi</p>
                            <ul className="mt-1 text-xs text-gray-500">
                                {formData.images.map((file, index) => (
                                    <li key={index} className="truncate">
                                        {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">Yangi rasmlar yuklash uchun (max 5 ta rasm, har biri 3MB dan kam)</p>
                </div>
                {/* Show existing images if available */}
                {apartment && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Mavjud rasmlar:</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map(num => {
                                const imgKey = `image${num}`;
                                if (apartment[imgKey]) {
                                    return (
                                        <div key={imgKey} className="relative">
                                            <img
                                                src={`https://fast.uysavdo.com/${apartment[imgKey]}`}
                                                alt={`Rasm ${num}`}
                                                className="w-full h-24 object-cover rounded-md"
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        disabled={loading}
                    >
                        Bekor qilish
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ? "Yuklanmoqda..." : "Saqlash"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditApartmentForm;