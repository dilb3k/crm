import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MaklerItem from "../components/MaklerItem";

const Maklerlar = () => {
    const navigate = useNavigate();
    const [maklers, setMaklers] = useState([]);
    const [originalMaklers, setOriginalMaklers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedMakler, setExpandedMakler] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedOverItem, setDraggedOverItem] = useState(null);
    const [positionUpdateLoading, setPositionUpdateLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [processingStatus, setProcessingStatus] = useState("");

    // Refs for scroll management
    const containerRef = useRef(null);
    const dragScrollIntervalRef = useRef(null);

    // CSS styles for drag and drop
    const dragDropStyles = `
    .drag-over-top {
        border-top: 3px solid #14b8a6 !important;
        margin-top: -3px;
        transform: translateY(-4px);
        transition: transform 0.15s ease-out;
    }

    .drag-over-bottom {
        border-bottom: 3px solid #14b8a6 !important;
        margin-bottom: -3px;
        transform: translateY(4px);
        transition: transform 0.15s ease-out;
    }

    .highlight-moved {
        animation: highlight-animation 0.8s ease;
    }

    @keyframes highlight-animation {
        0% { background-color: rgba(20, 184, 166, 0.2); }
        50% { background-color: rgba(20, 184, 166, 0.1); }
        100% { background-color: transparent; }
    }

    .makler-item {
        transition: all 0.2s ease;
    }

    .makler-item.dragging {
        opacity: 0.7;
        transform: scale(0.97);
        box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.1);
        border: 2px solid #14b8a6;
    }
    `;

    // Add drag-drop styles to document
    useEffect(() => {
        const styleEl = document.createElement('style');
        styleEl.textContent = dragDropStyles;
        document.head.appendChild(styleEl);

        return () => {
            // Clean up on unmount
            document.head.removeChild(styleEl);
            // Clear any ongoing scroll intervals
            if (dragScrollIntervalRef.current) {
                clearInterval(dragScrollIntervalRef.current);
            }
        };
    }, []);

    // Auto-scroll function during drag
    const autoScroll = useCallback((clientY) => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Define scroll threshold (100px from top or bottom)
        const topThreshold = containerRect.top + 500;
        const bottomThreshold = viewportHeight - 500;

        let scrollSpeed = 0;

        // Determine scroll speed and direction
        if (clientY < topThreshold) {
            // Scrolling up
            scrollSpeed = -20 * ((topThreshold - clientY) / 100);
        } else if (clientY > bottomThreshold) {
            // Scrolling down
            scrollSpeed = 20 * ((clientY - bottomThreshold) / 100);
        }

        // Apply scrolling
        if (scrollSpeed !== 0) {
            container.scrollTop += scrollSpeed;
        }
    }, []);

    // Rest of the existing useEffect and other methods from the second file...
    useEffect(() => {
        const fetchMaklers = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token yo'q!");
                setError("Token topilmadi");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    "https://fast.uysavdo.com/api/v1/adminka/maklers",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`API xatolik qaytardi: ${response.status}`);
                }

                const data = await response.json();

                if (!data || !Array.isArray(data)) {
                    throw new Error("API noto'g'ri formatda ma'lumot qaytardi");
                }

                // Add a unique index field to each makler to solve React key issues
                const enrichedData = data.map((makler, index) => ({
                    ...makler,
                    uniqueKey: `${makler.id}-${index}` // Create a guaranteed unique key
                }));

                setMaklers(enrichedData);
                setOriginalMaklers(enrichedData); // Store original order for comparison
            } catch (error) {
                console.error("Fetch xatolik berdi:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMaklers();
    }, []);

    const toggleMaklerExpanded = (maklerId) => {
        if (expandedMakler === maklerId) {
            setExpandedMakler(null);
        } else {
            setExpandedMakler(maklerId);
        }
    };

    // Function to check if the order has changed
    const checkForChanges = (updatedMaklers) => {
        if (updatedMaklers.length !== originalMaklers.length) return true;

        for (let i = 0; i < updatedMaklers.length; i++) {
            if (updatedMaklers[i].id !== originalMaklers[i].id) {
                return true;
            }
        }

        return false;
    };

    // Rest of the methods from the second file (updateMaklerPositions, handleDragStart, etc.)...
    // Function to update makler positions on the backend
    const updateMaklerPositions = async () => {
        setPositionUpdateLoading(true);
        setSaveSuccess(false);
        setProcessingStatus("Maklerlar pozitsiyalari yangilanmoqda...");
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("Token yo'q!");
            setPositionUpdateLoading(false);
            return false;
        }

        try {
            // Create a map to track which makler IDs we've seen
            const seenMaklerIds = new Set();

            // Filter out duplicate maklers and create positions array
            const positions = [];
            let position = 1; // Start from position 1

            maklers.forEach(makler => {
                // Only include each makler once
                if (!seenMaklerIds.has(makler.id)) {
                    seenMaklerIds.add(makler.id);
                    positions.push({
                        makler_id: Number(makler.id),
                        position: position++  // Assign position and increment
                    });
                }
            });

            console.log("Barcha maklerlar pozitsiyalari yangilanmoqda:");
            positions.forEach(pos => {
                const makler = maklers.find(m => m.id === pos.makler_id);
                console.log(`Makler ID: ${pos.makler_id}, Ismi: ${makler?.name}, Yangi pozitsiya: ${pos.position}`);
            });

            // Log the full payload being sent
            console.log("API ga jo'natilayotgan ma'lumotlar:", JSON.stringify({ positions }, null, 2));

            // Send all positions in a single request
            const response = await fetch(
                "https://fast.uysavdo.com/api/v1/adminka/update-makler-positions/",
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ positions })
                }
            );

            // Handle response
            if (response.status === 400) {
                const errorData = await response.json();
                console.error("API 400 xatoligi:", errorData);
                setProcessingStatus(`Xatolik: ${JSON.stringify(errorData)}`);
                throw new Error(`API 400 xatoligi: ${JSON.stringify(errorData)}`);
            }

            if (!response.ok) {
                throw new Error(`Pozitsiyalarni yangilashda xatolik: ${response.status}`);
            }

            // Log the response
            const responseData = await response.json();
            console.log("API javobi:", responseData);

            // Get the updated list to refresh UI
            try {
                const refreshResponse = await fetch(
                    "https://fast.uysavdo.com/api/v1/adminka/maklers",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (refreshResponse.ok) {
                    const refreshedData = await refreshResponse.json();

                    // Check for and remove any duplicates
                    const uniqueIds = new Set();
                    const uniqueData = refreshedData.filter(makler => {
                        if (uniqueIds.has(makler.id)) {
                            return false; // Skip duplicate
                        }
                        uniqueIds.add(makler.id);
                        return true;
                    });

                    // Add unique keys
                    const enrichedData = uniqueData.map((makler, index) => ({
                        ...makler,
                        uniqueKey: `${makler.id}-${index}`
                    }));

                    setMaklers(enrichedData);
                    setOriginalMaklers(enrichedData);
                }
            } catch (error) {
                console.log("Ma'lumotlarni yangilashda xatolik:", error);
            }

            setHasChanges(false);
            setSaveSuccess(true);
            setProcessingStatus("Barcha maklerlar muvaffaqiyatli yangilandi");

            setTimeout(() => {
                setSaveSuccess(false);
                setProcessingStatus("");
            }, 3000);

            return true;
        } catch (error) {
            console.error("Pozitsiyalarni yangilashda xatolik:", error);
            return false;
        } finally {
            setPositionUpdateLoading(false);
        }
    };

    // Drag and drop methods with auto-scroll
    const handleDragStart = (e, index) => {
        // Drag image (ghost) ko'rinishini yaxshilash
        const dragImage = document.createElement('div');
        dragImage.className = 'bg-teal-100 rounded-xl p-4 shadow-lg';
        dragImage.textContent = maklers[index].name;
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);

        // Drag element opacitysini o'zgartirish
        e.currentTarget.classList.add("dragging");

        // Drag ma'lumotlarini o'rnatish
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        setDraggedItem(index);

        // Setup auto-scroll interval
        dragScrollIntervalRef.current = setInterval(() => {
            autoScroll(e.clientY);
        }, 50); // Check and scroll every 50ms

        // Animatsiya uchun timeout
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    };

    const handleDragEnd = (e) => {
        // Clear the auto-scroll interval
        if (dragScrollIntervalRef.current) {
            clearInterval(dragScrollIntervalRef.current);
        }

        // Barcha visual effectlarni tozalash
        e.currentTarget.classList.remove("dragging");

        // Barcha elementlardan drag-over classlarni olib tashlash
        document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        setDraggedItem(null);
        setDraggedOverItem(null);
    };

    const handleDragOver = useCallback((e, index) => {
        e.preventDefault(); // Allow dropping
        e.stopPropagation(); // Prevent parent handlers

        // Update auto-scroll with current mouse position
        autoScroll(e.clientY);

        if (draggedItem === index) return; // Don't allow dropping on self

        // More sensitive drag over handling with lower throttling threshold
        if (!e.currentTarget.dataset.lastDragOver ||
            Date.now() - parseInt(e.currentTarget.dataset.lastDragOver) > 30) { // Reduced from 50 to 30

            e.currentTarget.dataset.lastDragOver = Date.now().toString();

            // Drag over visual indicators
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseY = e.clientY;
            const threshold = rect.top + rect.height / 2;

            // Remove existing indicators
            document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
                if (el !== e.currentTarget) {
                    el.classList.remove('drag-over-top', 'drag-over-bottom');
                }
            });

            // Add new indicator based on position
            if (mouseY < threshold) {
                e.currentTarget.classList.remove('drag-over-bottom');
                e.currentTarget.classList.add('drag-over-top');
                setDraggedOverItem({ index, position: 'top' });
            } else {
                e.currentTarget.classList.remove('drag-over-top');
                e.currentTarget.classList.add('drag-over-bottom');
                setDraggedOverItem({ index, position: 'bottom' });
            }
        }

        // Set dataTransfer properties
        e.dataTransfer.dropEffect = 'move';
    }, [draggedItem, autoScroll]);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-gray-50', 'transition-colors', 'duration-200');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-50');

        // Only remove indicators if we're leaving this element completely
        // (not just moving between child elements)
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
        }
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        e.stopPropagation();

        // Remove visual indicators
        e.currentTarget.classList.remove('bg-gray-50', 'drag-over-top', 'drag-over-bottom');

        if (draggedItem === index) return; // Don't allow dropping on self

        // Make a copy of the current maklers array
        const newMaklers = [...maklers];

        // Remove the dragged item from its original position
        const [draggedMakler] = newMaklers.splice(draggedItem, 1);

        // Calculate insert position based on whether we're dropping above or below
        let insertPosition = index;
        if (draggedItem < index && draggedOverItem?.position === 'top') {
            insertPosition--;
        } else if (draggedItem > index && draggedOverItem?.position === 'bottom') {
            insertPosition++;
        }

        // Adjust if out of bounds
        insertPosition = Math.max(0, Math.min(insertPosition, newMaklers.length));

        // Insert the dragged item at its new position
        newMaklers.splice(insertPosition, 0, draggedMakler);

        // Log the move with more details
        console.log(`Makler "${draggedMakler.name}" (ID: ${draggedMakler.id}) ${draggedItem + 1}-pozitsiyadan ${insertPosition + 1}-pozitsiyaga ko'chirildi`);

        // Add smooth animation to the moved item using class
        setTimeout(() => {
            const movedItem = document.querySelector(`[data-makler-id="${draggedMakler.id}"]`);
            if (movedItem) {
                movedItem.classList.add('highlight-moved');
                setTimeout(() => {
                    movedItem.classList.remove('highlight-moved');
                }, 1000);
            }
        }, 50);

        // Update the state with the new order
        setMaklers(newMaklers);

        // Check if the order has changed compared to the original
        setHasChanges(checkForChanges(newMaklers));
    };

    // Loading state rendering
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-4 rounded-lg bg-white shadow-md">
                    <div className="flex items-center space-x-3">
                        <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg font-medium text-gray-700">Ma'lumotlar yuklanmoqda...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state rendering
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-6 rounded-lg bg-white shadow-md max-w-md w-full">
                    <div className="flex items-center justify-center text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Xatolik yuz berdi</h3>
                    <p className="text-gray-600 text-center">{error}</p>
                </div>
            </div>
        );
    }

    // Empty state rendering
    if (!maklers.length) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-6 rounded-lg bg-white shadow-md max-w-md w-full">
                    <div className="flex items-center justify-center text-gray-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Maklerlar topilmadi</h3>
                    <p className="text-gray-600 text-center">So'ralgan ma'lumotlar mavjud emas</p>
                </div>
            </div>
        );
    }

    // Main component rendering
    return (
        <div
            ref={containerRef}
            className="bg-gray-50 min-h-screen pb-10 overflow-hidden"
        >
            <div className="max-w-2xl mx-auto px-4 pt-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Maklerlar Ro'yxati</h1>

                    {/* Save Changes Button */}
                    {hasChanges && (
                        <button
                            onClick={updateMaklerPositions}
                            disabled={positionUpdateLoading}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-sm hover:bg-teal-600 transition-colors flex items-center"
                        >
                            {positionUpdateLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saqlanmoqda...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>O'zgarishlarni saqlash</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Processing status message */}
                {positionUpdateLoading && processingStatus && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{processingStatus}</span>
                    </div>
                )}

                {/* Success message */}
                {saveSuccess && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Pozitsiyalar muvaffaqiyatli saqlandi!</span>
                    </div>
                )}

                {/* Help text for drag and drop */}
                <p className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Maklerlarni tartibini o'zgartirish uchun ularni yuqoriga yoki pastga sudrab qo'ying. O'zgarishlarni saqlash uchun "O'zgarishlarni saqlash" tugmasini bosing.
                </p>

                <div className="space-y-4">
                    {maklers.map((makler, index) => (
                        <MaklerItem
                            key={makler.uniqueKey}
                            makler={makler}
                            index={index}
                            isExpanded={expandedMakler === makler.id}
                            onToggleExpand={() => toggleMaklerExpanded(makler.id)}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        />
                    ))}
                </div>

                {/* Save button at the bottom for easy access when there are many maklers */}
                {hasChanges && (
                    <div className="sticky bottom-4 left-0 right-0 mt-6 flex justify-center">
                        <button
                            onClick={updateMaklerPositions}
                            disabled={positionUpdateLoading}
                            className="px-6 py-3 bg-teal-500 text-white rounded-full shadow-md hover:bg-teal-600 transition-colors flex items-center"
                        >
                            {positionUpdateLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saqlanmoqda...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>O'zgarishlarni saqlash</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Maklerlar;