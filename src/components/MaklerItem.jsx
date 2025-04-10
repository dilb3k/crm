import React, { useState } from "react";
import EditMaklerForm from "./EditMalerForm";

// Format the bio text with line breaks
const formatBioText = (text) => {
    return text.split('\n').map((line, index) => (
        <p key={index} className="mb-2 text-gray-700">{line}</p>
    ));
};

// Default placeholder image as base64 to avoid network requests
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5SYXNtIGpveSA8L3RleHQ+PC9zdmc+';

const MaklerItem = ({
    makler,
    index,
    isExpanded,
    onToggleExpand,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onMaklerUpdate // New prop for handling makler updates
}) => {
    // State to track if images have failed to load
    const [smallImageFailed, setSmallImageFailed] = useState(false);
    const [largeImageFailed, setLargeImageFailed] = useState(false);
    // State to control whether edit form is visible
    const [isEditing, setIsEditing] = useState(false);
    // Local state for the makler data that can be updated
    const [maklerData, setMaklerData] = useState(makler);

    // Generate image URL only if photo exists
    const getImageUrl = (photo) => {
        return photo ? `https://fast.uysavdo.com/uploads/${photo}` : PLACEHOLDER_IMAGE;
    };

    // Handle saving edited makler data
    const handleSave = (updatedMakler) => {
        setMaklerData(updatedMakler);
        setIsEditing(false);
        // Reset image failure states when data is updated
        setSmallImageFailed(false);
        setLargeImageFailed(false);
        // Propagate the update to parent component
        if (onMaklerUpdate) {
            onMaklerUpdate(updatedMakler);
        }
    };

    // If in editing mode, show the edit form
    if (isEditing) {
        return (
            <div className="makler-item bg-white rounded-xl shadow-sm transition-all duration-300">
                <EditMaklerForm
                    makler={maklerData}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    // Otherwise show the normal makler item
    return (
        <div
            data-makler-id={maklerData.id}
            className="makler-item bg-white rounded-xl shadow-sm max-h-[400px] overflow-auto transition-all duration-300"
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
        >
            {/* Clickable header section with drag handle */}
            <div className="py-4 px-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 sticky top-0 bg-white z-10">
                {/* Drag handle */}
                <div
                    className="flex items-center w-full"
                    onClick={onToggleExpand}
                >
                    <div className="w-14 h-14 rounded-full overflow-hidden mr-4 flex-shrink-0">
                        <img
                            src={smallImageFailed ? PLACEHOLDER_IMAGE : getImageUrl(maklerData.photo)}
                            alt={maklerData.name}
                            className="w-full h-full object-cover"
                            onError={() => setSmallImageFailed(true)}
                        />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800 text-lg">{maklerData.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span>{maklerData.phone}</span>
                            <span className="mx-2">•</span>
                            <div className="flex items-center">
                                <span className="font-medium">{maklerData.rating ? maklerData.rating.toFixed(1) : "0.0"}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center">
                        {/* Edit button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent toggling expansion
                                setIsEditing(true);
                            }}
                            className="mr-3 p-1 rounded-full hover:bg-gray-100"
                            title="Edit makler"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        {/* Drag icon */}
                        <div className="mr-4 cursor-grab active:cursor-grabbing touch-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                        </div>

                        {/* Expand/collapse icon */}
                        <div onClick={onToggleExpand}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable detail section */}
            <div
                className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="border-t border-gray-100 p-6">
                    {/* Larger photo */}
                    <div className="flex justify-center mb-6">
                        <div className="w-48 h-48 bg-white rounded-lg p-2 shadow">
                            <img
                                src={largeImageFailed ? PLACEHOLDER_IMAGE : getImageUrl(maklerData.photo)}
                                alt={maklerData.name}
                                className="w-full h-full object-cover rounded-lg"
                                onError={() => setLargeImageFailed(true)}
                            />
                        </div>
                    </div>

                    {/* Makler details */}
                    <div className="space-y-4">
                        {/* Experience */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <span className="text-gray-500 font-medium">Tajriba</span>
                            <span className="text-right font-semibold text-gray-800">{maklerData.expiriense} yil</span>
                        </div>

                        {/* Bio */}
                        <div className="pt-2">
                            <div className="mb-2">
                                <span className="text-gray-500 font-medium">Izoh</span>
                            </div>
                            <div className="mt-2 text-gray-700">
                                {formatBioText(maklerData.bio || "Ma'lumot mavjud emas")}
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            {/* Edit Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsEditing(true);
                                }}
                                className="flex-1 py-3 mt-6 text-center font-medium border border-teal-600 text-teal-600 rounded-xl shadow-sm hover:bg-teal-50 transition-colors"
                            >
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Tahrirlash
                                </span>
                            </button>

                            {/* Call Button */}
                            <a
                                href={`tel:${maklerData.phone}`}
                                className="flex-1 py-3 mt-6 text-center text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                style={{
                                    background: "linear-gradient(90deg, #0AA3A1 0%, #B4C29E 100%)"
                                }}
                            >
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Qo'ng'iroq qilish
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaklerItem;