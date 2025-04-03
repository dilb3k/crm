import React, { useState, useEffect } from "react";
import Compressor from 'compressorjs';

const EditApartmentForm = ({ apartment, id, onCancel, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
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
        description: ""
    });

    // Initialize form data and existing images when apartment data is available
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
                description: apartment.description || ""
            });

            // Collect existing images
            const images = [];
            for (let i = 1; i <= 5; i++) {
                const imgKey = `image${i}`;
                if (apartment[imgKey]) {
                    images.push({
                        id: i,
                        path: apartment[imgKey],
                        url: `https://fast.uysavdo.com/${apartment[imgKey]}`
                    });
                }
            }
            setExistingImages(images);
        }
    }, [apartment]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
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

    // Handle individual image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Check if total images would exceed 5
        if (existingImages.length - imagesToDelete.length + newImages.length >= 5) {
            alert("Maksimal 5 ta rasm yuklash mumkin!");
            return;
        }

        // Check file size
        if (file.size > 3 * 1024 * 1024) {
            alert("Rasm hajmi juda katta (>3MB)");
            return;
        }

        try {
            // Compress the image
            const compressedFile = await compressImage(file);
            setNewImages(prev => [...prev, compressedFile]);
        } catch (error) {
            alert("Rasmni siqishda xatolik: " + error.message);
        }
    };

    // Remove a new (not yet uploaded) image
    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    // Toggle an existing image for deletion
    const toggleImageDelete = (imageId) => {
        if (imagesToDelete.includes(imageId)) {
            setImagesToDelete(prev => prev.filter(id => id !== imageId));
        } else {
            setImagesToDelete(prev => [...prev, imageId]);
        }
    };

    // Image compression function with stronger compression
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality: 0.4,
                maxWidth: 800,
                maxHeight: 800,
                convertSize: 1000000,
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

        console.log("Submitting with:", {
            formData,
            existingImages: existingImages.length,
            imagesToDelete: imagesToDelete,
            newImages: newImages.length
        });

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Tizimga kiring!");
            setLoading(false);
            return;
        }

        try {
            // Create FormData for the body
            const formDataToSend = new FormData();

            // Since 'images' is required by the API, we must always include it
            if (newImages.length > 0) {
                // If we have new images, add them to the 'images' field
                newImages.forEach(image => {
                    if (image && image.size <= 1 * 1024 * 1024) {
                        formDataToSend.append('images', image);
                    } else {
                        throw new Error(`Rasm juda katta. Maksimal hajm 1MB.`);
                    }
                });
            } else {
                // If no new images, add an empty file to satisfy the API requirement
                formDataToSend.append('images', new File([], 'empty.jpg', { type: 'image/jpeg' }));
            }

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

            // Flag to preserve existing images unless explicitly deleted
            queryParams.append('preserve_images', 'true');

            // Add images to delete parameter if any
            if (imagesToDelete.length > 0) {
                imagesToDelete.forEach(imgId => {
                    queryParams.append('delete_images', `image${imgId}`);
                });
            }

            // Process new images if any
            if (newImages.length > 0) {
                // Add new images to the 'images' field - this is the required field
                newImages.forEach(image => {
                    if (image && image.size <= 1 * 1024 * 1024) {
                        formDataToSend.append('images', image);
                    } else {
                        throw new Error(`Rasm juda katta. Maksimal hajm 1MB.`);
                    }
                });
            } else {
                // If no new images, we still need to provide the 'images' field
                // Add an empty file to satisfy the API requirement
                const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
                formDataToSend.append('images', emptyFile);
            }

            // Build the URL with query parameters
            const url = `https://fast.uysavdo.com/api/v1/adminka/update_ads/${id}?${queryParams.toString()}`;

            console.log("Sending request to:", url);

            // Log some info to help debug
            console.log("Form data keys:", [...formDataToSend.keys()]);

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
            console.log("API response:", result);

            if (result.status) {
                // Call the success callback with updated data
                onSuccess(result.data);
                // Show success message
                alert("Muvaffaqiyatli tahrirlandi!");
            } else {
                throw new Error(result.message || "Tahrirlashda xatolik yuz berdi");
            }
        } catch (error) {
            console.error("Error during submission:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Get the total active images count (existing - to be deleted + new)
    const totalActiveImages = existingImages.length - imagesToDelete.length + newImages.length;

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

                {/* Images Section */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Rasmlar</label>
                        <span className="text-sm text-gray-500">
                            {totalActiveImages}/5 ta rasm
                        </span>
                    </div>

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Mavjud rasmlar:</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {existingImages.map((image) => (
                                    <div key={image.id} className={`relative border rounded-md overflow-hidden ${imagesToDelete.includes(image.id) ? 'opacity-40' : ''}`}>
                                        <img
                                            src={image.url}
                                            alt={`Rasm ${image.id}`}
                                            className="w-full h-24 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleImageDelete(image.id)}
                                            className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center 
                                                ${imagesToDelete.includes(image.id)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'}`}
                                        >
                                            {imagesToDelete.includes(image.id) ? '↺' : '×'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New images */}
                    {newImages.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Yangi rasmlar:</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {newImages.map((file, index) => (
                                    <div key={index} className="relative border rounded-md overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Yangi rasm ${index + 1}`}
                                            className="w-full h-24 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add new image button - disabled if already at 5 images */}
                    {totalActiveImages < 5 && (
                        <div className="mt-2">
                            <label className={`flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer ${totalActiveImages >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}`}>
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    accept="image/jpeg,image/png,image/gif"
                                    className="hidden"
                                    disabled={totalActiveImages >= 5}
                                />
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Rasm qo'shish
                                    </span>
                                    <span className="mt-1 block text-xs text-gray-500">
                                        Max 3MB
                                    </span>
                                </div>
                            </label>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        Har bir rasm 3MB dan kichik bo'lishi kerak. Maksimal 5 ta rasm.
                    </p>
                </div>

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