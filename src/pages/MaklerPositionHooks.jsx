import { useState, useCallback } from 'react';

export const MaklerPositionsHooks = (maklers, setMaklers, setOriginalMaklers) => {
    const [hasChanges, setHasChanges] = useState(false);
    const [positionUpdateLoading, setPositionUpdateLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [processingStatus, setProcessingStatus] = useState("");

    // Function to update makler positions on the backend
    const updateMaklerPositions = useCallback(async () => {
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
    }, [maklers, setMaklers, setOriginalMaklers]);

    return {
        hasChanges,
        setHasChanges,
        positionUpdateLoading,
        saveSuccess,
        processingStatus,
        updateMaklerPositions,
        setSaveSuccess,
        setProcessingStatus,
        setPositionUpdateLoading
    };
};