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
    // YANGI: oxirgi almashish vaqtini saqlash uchun
    const [lastSwapTime, setLastSwapTime] = useState(0);

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
    
    /* YANGI: Avtomatik almashish uchun animatsiyalar */
    @keyframes swap-down {
        0% { transform: translateY(0); }
        50% { transform: translateY(50px); opacity: 0.7; }
        100% { transform: translateY(0); }
    }

    @keyframes swap-up {
        0% { transform: translateY(0); }
        50% { transform: translateY(-50px); opacity: 0.7; }
        100% { transform: translateY(0); }
    }

    .swap-down {
        animation: swap-down 0.3s ease;
        border-bottom: 2px solid #14b8a6;
    }

    .swap-up {
        animation: swap-up 0.3s ease;
        border-top: 2px solid #14b8a6;
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

    // Advanced auto-scroll function
    const autoScroll = useCallback((clientY) => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();

        // Define scroll zones
        const SCROLL_ZONE_HEIGHT = 100;
        const topScrollZone = containerRect.top + SCROLL_ZONE_HEIGHT;
        const bottomScrollZone = containerRect.bottom - SCROLL_ZONE_HEIGHT;

        let scrollSpeed = 0;

        // Upward scrolling
        if (clientY < topScrollZone) {
            const distanceFromTop = topScrollZone - clientY;
            scrollSpeed = -Math.pow(distanceFromTop / 10, 2.5);
        }
        // Downward scrolling
        else if (clientY > bottomScrollZone) {
            const distanceFromBottom = clientY - bottomScrollZone;
            scrollSpeed = Math.pow(distanceFromBottom / 10, 2.5);
        }

        // Limit scroll speed
        const MAX_SCROLL_SPEED = 50;
        scrollSpeed = Math.sign(scrollSpeed) * Math.min(Math.abs(scrollSpeed), MAX_SCROLL_SPEED);

        // Prevent scrolling beyond container limits
        const currentScroll = container.scrollTop;
        const maxScroll = container.scrollHeight - container.clientHeight;

        if (currentScroll + scrollSpeed < 0) {
            scrollSpeed = -currentScroll;
        } else if (currentScroll + scrollSpeed > maxScroll) {
            scrollSpeed = maxScroll - currentScroll;
        }

        // Apply scrolling
        if (scrollSpeed !== 0) {
            container.scrollTop += scrollSpeed;
        }
    }, []);
    // YANGI: Elementlarni almashtirib qo'yish uchun funksiya
    const swapMaklers = useCallback((index1, index2) => {
        // Hozirgi vaqtni olish
        const now = Date.now();

        // Agar oxirgi almashishdan 300ms o'tmagan bo'lsa, almashishni bajarmaymiz
        // Bu ko'p marta ketma-ket almashishlarni oldini oladi
        if (now - lastSwapTime < 300) return;

        // Yangi vaqtni saqlash
        setLastSwapTime(now);

        // Elementlarni almashtiramiz
        const newMaklers = [...maklers];
        const temp = newMaklers[index1];
        newMaklers[index1] = newMaklers[index2];
        newMaklers[index2] = temp;

        // Maklerlarni yangilash
        setMaklers(newMaklers);

        // O'zgarishlar borligini belgilash
        setHasChanges(true);

        // Animatsiya qo'shish - tepadagi element pastga, pastdagi yuqoriga
        const element1 = document.querySelector(`[data-index="${index1}"]`);
        const element2 = document.querySelector(`[data-index="${index2}"]`);

        if (index1 > index2) {
            // Element1 tepaga ko'tariladi
            element1?.classList.add('swap-up');
            // Element2 pastga tushadi
            element2?.classList.add('swap-down');
        } else {
            // Element1 pastga tushadi
            element1?.classList.add('swap-down');
            // Element2 tepaga ko'tariladi
            element2?.classList.add('swap-up');
        }

        // Animatsiyalarni tozalash
        setTimeout(() => {
            element1?.classList.remove('swap-up', 'swap-down');
            element2?.classList.remove('swap-up', 'swap-down');
        }, 300);
    }, [maklers, lastSwapTime]);

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

    // O'ZGARTIRILGAN: DragOver handleri - boshqa makler ustida turgan paytda ular o'rnini almashtiramiz
    const handleDragOver = useCallback((e, index) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent dropping on self
        if (draggedItem === index) return;

        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const mouseY = e.clientY;

        // Scroll calculation with more aggressive downward scroll
        let scrollSpeed = 0;
        const SCROLL_ZONE_HEIGHT = 100; // Scroll activation zone
        const bottomScrollZone = viewportHeight - SCROLL_ZONE_HEIGHT;

        // Hyper-aggressive downward scrolling
        if (mouseY > bottomScrollZone) {
            const distanceFromBottom = mouseY - bottomScrollZone;
            // Exponential scroll speed for lightning-fast downward movement
            scrollSpeed = Math.pow(distanceFromBottom / 10, 3) * 3;

            // Limit maximum scroll speed
            scrollSpeed = Math.min(scrollSpeed, 200);

            // Prevent scrolling beyond container limits
            const currentScroll = container.scrollTop;
            const maxScroll = container.scrollHeight - container.clientHeight;

            if (currentScroll + scrollSpeed > maxScroll) {
                scrollSpeed = maxScroll - currentScroll;
            }

            // Apply scrolling
            container.scrollTop += scrollSpeed;
        }

        // Track last drag time to prevent too frequent updates
        const now = Date.now();
        const DRAG_THROTTLE_DELAY = 50;

        // Intelligent swap mechanism with reduced frequency
        if (!lastSwapTime || now - lastSwapTime >= DRAG_THROTTLE_DELAY) {
            // Create a copy of maklers to avoid direct mutation
            const newMaklers = [...maklers];

            // Remove dragged item from original position
            const [draggedMakler] = newMaklers.splice(draggedItem, 1);

            // Insert at new position
            newMaklers.splice(index, 0, draggedMakler);

            // Update state with new order
            setMaklers(newMaklers);
            setDraggedItem(index);
            setLastSwapTime(now);
            setHasChanges(true);
        }

        // Visual indicators
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseYInElement = e.clientY;
        const threshold = rect.top + rect.height / 2;

        // Clear previous indicators
        document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        // Add new indicator based on precise mouse position
        if (mouseYInElement < threshold) {
            e.currentTarget.classList.remove('drag-over-bottom');
            e.currentTarget.classList.add('drag-over-top');
            setDraggedOverItem({ index, position: 'top' });
        } else {
            e.currentTarget.classList.remove('drag-over-top');
            e.currentTarget.classList.add('drag-over-bottom');
            setDraggedOverItem({ index, position: 'bottom' });
        }

        // Set drag effect
        e.dataTransfer.dropEffect = 'move';
    }, [draggedItem, maklers, lastSwapTime]);

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

    // O'ZGARTIRILGAN: Drop handler - elementlar allaqachon almashinib bo'lgani uchun, biz faqat visual effektlarni tozalaymiz
    const handleDrop = (e, index) => {
        e.preventDefault();
        e.stopPropagation();

        // Remove visual indicators
        e.currentTarget.classList.remove('bg-gray-50', 'drag-over-top', 'drag-over-bottom');

        // Highlight effect qo'shish
        setTimeout(() => {
            const movedItem = document.querySelector(`[data-index="${index}"]`);
            if (movedItem) {
                movedItem.classList.add('highlight-moved');
                setTimeout(() => {
                    movedItem.classList.remove('highlight-moved');
                }, 1000);
            }
        }, 50);
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
            className="bg-gray-50 min-h-screen pb-10 overflow-auto" // O'ZGARTIRILGAN: overflow-hidden → overflow-auto
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
                    Maklerlarni tartibini o'zgartirish uchun ularni yuqoriga yoki pastga sudrab qo'ying. Siz biror maklerni ustiga sichqonchani keltirsangiz, ular avtomatik o'rin almashadi. O'zgarishlarni saqlash uchun "O'zgarishlarni saqlash" tugmasini bosing.
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
                            data-makler-id={makler.id}
                            data-index={index}
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