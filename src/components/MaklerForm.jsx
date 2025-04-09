import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MaklerForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        bio: "",
        expiriense: "", // Note: matches backend spelling from the image
        photo: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [photoName, setPhotoName] = useState("");
    const [emptyFields, setEmptyFields] = useState({
        bio: false,
        expiriense: false,
        photo: false
    });

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle empty field checkboxes
    const handleEmptyFieldChange = (e) => {
        const { name, checked } = e.target;
        setEmptyFields(prev => ({
            ...prev,
            [name]: checked
        }));

        // If checkbox is checked, clear the field value
        if (checked) {
            setFormData(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo: file
            }));
            setPhotoName(file.name);
        }
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token yo'q!");
            }

            // Create a FormData object for multipart/form-data (needed for file upload)
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("phone", formData.phone);

            // Only append optional fields if they're not marked as empty
            if (!emptyFields.bio && formData.bio) {
                submitData.append("bio", formData.bio);
            }

            if (!emptyFields.expiriense && formData.expiriense) {
                submitData.append("expiriense", formData.expiriense);
            }

            if (!emptyFields.photo && formData.photo) {
                submitData.append("photo", formData.photo);
            }

            // Send the API request
            const response = await fetch(
                "https://fast.uysavdo.com/api/v1/adminka/add_makler",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                        // Note: Don't set Content-Type when using FormData
                        // The browser will set it automatically with the correct boundary
                    },
                    body: submitData
                }
            );

            // Handle API response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `API xatolik qaytardi: ${response.status}`);
            }

            const data = await response.json();
            console.log("Makler qo'shildi:", data);

            // Show success message and reset form
            setSuccess(true);
            setFormData({
                name: "",
                phone: "",
                bio: "",
                expiriense: "",
                photo: null
            });
            setPhotoName("");
            setEmptyFields({
                bio: false,
                expiriense: false,
                photo: false
            });

            // Redirect after short delay
            setTimeout(() => {
                navigate("/maklerlar");
            }, 2000);

        } catch (error) {
            console.error("Xatolik yuz berdi:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Yangi Makler Qo'shish</h1>

                {/* Success message */}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Makler muvaffaqiyatli qo'shildi!</span>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name field (required) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter name"
                        />
                        <p className="mt-1 text-xs text-gray-500">string</p>
                    </div>

                    {/* Phone field (required) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="+998901234567"
                        />
                        <p className="mt-1 text-xs text-gray-500">string</p>
                    </div>

                    {/* Bio field (optional) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <input
                            type="text"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            disabled={emptyFields.bio}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-400"
                            placeholder="Enter bio"
                        />
                        <p className="mt-1 text-xs text-gray-500">string</p>
                        <div className="mt-1">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="bio"
                                    checked={emptyFields.bio}
                                    onChange={handleEmptyFieldChange}
                                    className="rounded text-teal-500 focus:ring-teal-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Send empty value</span>
                            </label>
                        </div>
                    </div>

                    {/* Experience field (optional) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Experience
                        </label>
                        <input
                            type="number"
                            name="expiriense"
                            value={formData.expiriense}
                            onChange={handleInputChange}
                            disabled={emptyFields.expiriense}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-400"
                            placeholder="Enter years of experience"
                        />
                        <p className="mt-1 text-xs text-gray-500">integer</p>
                        <div className="mt-1">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="expiriense"
                                    checked={emptyFields.expiriense}
                                    onChange={handleEmptyFieldChange}
                                    className="rounded text-teal-500 focus:ring-teal-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Send empty value</span>
                            </label>
                        </div>
                    </div>

                    {/* Photo field (optional) */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photo
                        </label>
                        <div className="flex items-center">
                            <label className={`flex items-center justify-center px-4 py-2 rounded-md ${emptyFields.photo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer'} transition-colors`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Choose file</span>
                                <input
                                    type="file"
                                    name="photo"
                                    onChange={handleFileChange}
                                    disabled={emptyFields.photo}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </label>
                            <span className="ml-3 text-sm text-gray-500 truncate max-w-[200px]">
                                {photoName || "No file chosen"}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">string(binary)</p>
                        <div className="mt-1">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="photo"
                                    checked={emptyFields.photo}
                                    onChange={handleEmptyFieldChange}
                                    className="rounded text-teal-500 focus:ring-teal-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Send empty value</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => navigate("/maklerlar")}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:bg-teal-300"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saqlanmoqda...</span>
                                </div>
                            ) : "Saqlash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaklerForm;