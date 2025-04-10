import React, { useState, useEffect } from "react";
import Compressor from 'compressorjs';

const EditMaklerForm = ({ makler, onSave, onCancel }) => {
    // Initialize form state with makler data
    const [formData, setFormData] = useState({
        name: makler.name || "",
        phone: makler.phone || "",
        bio: makler.bio || "",
        expiriense: makler.expiriense || 0
    });
    const [currentPhoto, setCurrentPhoto] = useState(makler.photo || null);
    const [newPhoto, setNewPhoto] = useState(null);
    const [deletePhoto, setDeletePhoto] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Update form data when makler prop changes
    useEffect(() => {
        if (makler) {
            setFormData({
                name: makler.name || "",
                phone: makler.phone || "",
                bio: makler.bio || "",
                expiriense: makler.expiriense || 0
            });
            setCurrentPhoto(makler.photo || null);
            setDeletePhoto(false);
            setNewPhoto(null);
        }
    }, [makler]);

    // Handle input changes
    const handleChange = (e) => {
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

    // Image compression function
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality: 0.6,
                maxWidth: 800,
                maxHeight: 800,
                convertSize: 500000, // 500KB
                success(result) {
                    resolve(result);
                },
                error(err) {
                    reject(err);
                },
            });
        });
    };

    // Handle photo upload
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size
        if (file.size > 2 * 1024 * 1024) {
            setError("Rasm hajmi juda katta (>2MB)");
            return;
        }

        try {
            // Compress the image
            const compressedFile = await compressImage(file);

            // When adding a new photo, automatically set deletePhoto to true if there's a current photo
            // This ensures the old photo is replaced, not preserved alongside the new one
            if (currentPhoto) {
                setDeletePhoto(true);
            }

            setNewPhoto(compressedFile);
        } catch (err) {
            setError("Rasmni siqishda xatolik: " + err.message);
        }
    };

    // Toggle photo deletion
    const togglePhotoDelete = () => {
        setDeletePhoto(!deletePhoto);
        if (!deletePhoto) {
            setNewPhoto(null); // Clear any new photo if marking for deletion
        }
    };

    // Remove new photo
    const removeNewPhoto = () => {
        setNewPhoto(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Tizimga kiring!");
                setIsLoading(false);
                return;
            }

            // Create FormData for the request
            const formDataToSend = new FormData();

            // Add form fields to the form data
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // Always explicitly set the photo status to handle replacement properly
            if (newPhoto) {
                // If there's a new photo, remove the old one first (if it exists)
                formDataToSend.append('delete_photo', 'true');
                // Then add the new photo
                formDataToSend.append('photo', newPhoto);
                formDataToSend.append('replace_photo', 'true');
            } else if (deletePhoto) {
                // If just deleting the current photo without a replacement
                formDataToSend.append('delete_photo', 'true');
                formDataToSend.append('photo', new File([], 'empty.jpg', { type: 'image/jpeg' }));
            }

            // Build the URL
            const url = `https://fast.uysavdo.com/api/v1/adminka/edit_makler/${makler.id}`;

            // Log what we're sending for debugging
            console.log("Sending update with:", {
                newPhoto: newPhoto ? "yes" : "no",
                deletePhoto,
                formData: Object.fromEntries(formDataToSend.entries())
            });

            // Send the request
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                let errorMessage = `Error: ${response.status}`;

                try {
                    // Try to parse the error response
                    const errorText = await response.text();

                    // If it's JSON, try to extract a more specific message
                    if (errorText.trim().startsWith('{')) {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.message) {
                            errorMessage = errorJson.message;
                        } else if (errorJson.detail) {
                            errorMessage = errorJson.detail;
                        }
                    }
                } catch (e) {
                    // If we can't parse the response, just use the status code
                    console.error("Error parsing error response:", e);
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Update the local state with the results
            setSuccess(true);

            // Update the current photo if a new one was uploaded
            if (newPhoto) {
                setCurrentPhoto(result.photo);
                setNewPhoto(null);
            } else if (deletePhoto) {
                setCurrentPhoto(null);
                setDeletePhoto(false);
            }

            // Call the onSave callback with updated data
            if (onSave) {
                const updatedMakler = {
                    ...makler,
                    ...formData,
                    photo: newPhoto ? result.photo : (deletePhoto ? null : currentPhoto)
                };
                onSave(updatedMakler);
            }
        } catch (err) {
            console.error("Error during submission:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-xl mb-4">Makler ma'lumotlarini tahrirlash</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg">
                    Muvaffaqiyatli saqlandi!
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Name field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Ism *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Phone field */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Telefon *
                        </label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Bio field */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            Izoh
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Experience field */}
                    <div>
                        <label htmlFor="expiriense" className="block text-sm font-medium text-gray-700 mb-1">
                            Tajriba (yil)
                        </label>
                        <input
                            type="number"
                            id="expiriense"
                            name="expiriense"
                            value={formData.expiriense}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Photo field */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Rasm</label>
                        </div>

                        {/* Current photo - only show if not being replaced by a new photo */}
                        {currentPhoto && !deletePhoto && !newPhoto && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Joriy rasm:</p>
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                                        <img
                                            src={`https://fast.uysavdo.com/uploads/${currentPhoto}`}
                                            alt="Current Photo"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5SYXNtIGpveSA8L3RleHQ+PC9zdmc+'
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={togglePhotoDelete}
                                        className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Display if photo is marked for deletion without a replacement */}
                        {currentPhoto && deletePhoto && !newPhoto && (
                            <div className="mb-4">
                                <p className="text-sm text-red-600 mb-2">Rasm o'chiriladi</p>
                                <button
                                    type="button"
                                    onClick={togglePhotoDelete}
                                    className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Bekor qilish
                                </button>
                            </div>
                        )}

                        {/* Message when replacing photo */}
                        {currentPhoto && newPhoto && (
                            <div className="mb-2">
                                <p className="text-sm text-amber-600">Joriy rasm yangi rasm bilan almashtiriladi</p>
                            </div>
                        )}

                        {/* New photo preview */}
                        {newPhoto && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Yangi rasm:</p>
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                                        <img
                                            src={URL.createObjectURL(newPhoto)}
                                            alt="New Photo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeNewPhoto}
                                        className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                        {(newPhoto.size / (1024 * 1024)).toFixed(2)} MB
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload button - only show if no new photo and not deleting */}
                        {!newPhoto && (
                            <div className="mt-2">
                                <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:border-teal-400">
                                    <input
                                        type="file"
                                        onChange={handlePhotoUpload}
                                        accept="image/jpeg,image/png,image/gif"
                                        className="hidden"
                                    />
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                            Rasm qo'shish
                                        </span>
                                        <span className="mt-1 block text-xs text-gray-500">
                                            Max 2MB
                                        </span>
                                    </div>
                                </label>
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                            Rasm 2MB dan kichik bo'lishi kerak.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            disabled={isLoading}
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditMaklerForm;