import React, { useRef, useEffect } from "react";

const MapComponent = ({ onCoordinatesUpdate, onAddressUpdate, initialLatitude, initialLongitude }) => {
    const mapRef = useRef(null);
    const yandexMapRef = useRef(null);
    const placemarkRef = useRef(null);
    const geocoderRef = useRef(null);

    // Initialize the map after component is mounted
    useEffect(() => {
        // Destroy existing map to prevent duplicates
        if (yandexMapRef.current) {
            yandexMapRef.current.destroy();
            yandexMapRef.current = null;
        }

        // Function to initialize the map
        const initializeMap = () => {
            // Check if map container exists
            if (!mapRef.current) {
                console.error("Map container not found");
                return;
            }

            try {
                // Default coordinates (Tashkent, Uzbekistan)
                const defaultCoords = [41.311081, 69.240562];

                // Use initial coordinates if provided
                const initialCoords = initialLatitude && initialLongitude
                    ? [Number(initialLatitude), Number(initialLongitude)]
                    : defaultCoords;

                // Create map instance
                window.ymaps.ready(() => {
                    console.log("Yandex Maps ready");

                    // Ensure container visibility
                    mapRef.current.style.height = '400px';

                    // Initialize geocoder
                    geocoderRef.current = window.ymaps.geocode;

                    // Create map only if it doesn't exist
                    if (!yandexMapRef.current) {
                        yandexMapRef.current = new window.ymaps.Map(mapRef.current, {
                            center: initialCoords,
                            zoom: 12,
                            controls: ['zoomControl', 'searchControl']
                        });

                        // Create marker
                        placemarkRef.current = new window.ymaps.Placemark(initialCoords, {
                            hintContent: 'Select location'
                        }, {
                            draggable: true
                        });

                        // Add marker to map
                        yandexMapRef.current.geoObjects.add(placemarkRef.current);

                        // Update form data when marker is dragged
                        placemarkRef.current.events.add('dragend', function () {
                            const coords = placemarkRef.current.geometry.getCoordinates();
                            onCoordinatesUpdate(
                                coords[0].toFixed(6),
                                coords[1].toFixed(6)
                            );

                            // Get address data using geocoder
                            getAddressFromCoords(coords);
                        });

                        // Allow setting marker by clicking on map
                        yandexMapRef.current.events.add('click', function (e) {
                            const coords = e.get('coords');
                            placemarkRef.current.geometry.setCoordinates(coords);
                            onCoordinatesUpdate(
                                coords[0].toFixed(6),
                                coords[1].toFixed(6)
                            );

                            // Get address data using geocoder
                            getAddressFromCoords(coords);
                        });

                        // Handle search control results to ensure single marker
                        const searchControl = yandexMapRef.current.controls.get('searchControl');
                        if (searchControl) {
                            searchControl.events.add('resultshow', function (e) {
                                // When search shows results, get the selected result and move our marker there
                                const searchResults = searchControl.getResultsArray();
                                if (searchResults && searchResults.length > 0) {
                                    // Get coordinates of the first search result
                                    searchResults[0].geometry.getCoordinates().then(function (coords) {
                                        // Clear any search markers by reloading the map layers
                                        yandexMapRef.current.geoObjects.removeAll();
                                        yandexMapRef.current.geoObjects.add(placemarkRef.current);

                                        // Move our marker to the search result coordinates
                                        placemarkRef.current.geometry.setCoordinates(coords);

                                        // Update form with new coordinates
                                        onCoordinatesUpdate(
                                            coords[0].toFixed(6),
                                            coords[1].toFixed(6)
                                        );

                                        // Get address data
                                        getAddressFromCoords(coords);
                                    });
                                }
                            });
                        }

                        // Setup event handler for the map to clear all extra markers
                        yandexMapRef.current.events.add('boundschange', function () {
                            // Count the number of geoObjects and remove any extras
                            const geoObjectsCount = yandexMapRef.current.geoObjects.getLength();
                            if (geoObjectsCount > 1) {
                                // Keep only our placemark
                                yandexMapRef.current.geoObjects.removeAll();
                                yandexMapRef.current.geoObjects.add(placemarkRef.current);
                            }
                        });

                        console.log("Map initialized successfully");
                    }
                });
            } catch (error) {
                console.error("Error initializing map:", error);
            }
        };

        // Function to get address data from coordinates using Yandex geocoder
        const getAddressFromCoords = (coords) => {
            if (!geocoderRef.current) return;

            // Get address through static API (Yandex Geocoder API)
            geocoderRef.current(coords).then(function (res) {
                try {
                    // Get first GeoObject from result
                    const firstGeoObject = res.geoObjects.get(0);

                    if (firstGeoObject) {
                        // Get all properties for debugging
                        const allProperties = firstGeoObject.properties.getAll();
                        console.log("Geocoder all properties:", allProperties);

                        // Use only methods definitely available in API
                        const fullAddress = firstGeoObject.getAddressLine() || '';
                        console.log("Full address:", fullAddress);

                        // Simplified address extraction
                        let tuman = '';
                        let kvartl = '';
                        let joylashuv = fullAddress;

                        // Extract district from components if available
                        if (allProperties.metaDataProperty &&
                            allProperties.metaDataProperty.GeocoderMetaData &&
                            allProperties.metaDataProperty.GeocoderMetaData.Address &&
                            allProperties.metaDataProperty.GeocoderMetaData.Address.Components) {

                            const components = allProperties.metaDataProperty.GeocoderMetaData.Address.Components;

                            // Look for district component
                            components.forEach(component => {
                                if (component.kind === 'district') {
                                    tuman = component.name;
                                }
                            });
                        }

                        // Check if balloonContent is available and extract data from it
                        if (allProperties.balloonContent) {
                            // Try to parse location and district from balloonContent HTML
                            try {
                                const balloonContent = allProperties.balloonContent;

                                // Extract h3 content (location)
                                const locationMatch = balloonContent.match(/<h3>(.*?)<\/h3>/);
                                if (locationMatch && locationMatch[1]) {
                                    joylashuv = locationMatch[1];
                                }

                                // Extract p content (district)
                                const districtMatch = balloonContent.match(/<p>(.*?)<\/p>/);
                                if (districtMatch && districtMatch[1]) {
                                    tuman = districtMatch[1];
                                }

                                console.log("Extracted from balloonContent - Location:", joylashuv, "District:", tuman);
                            } catch (e) {
                                console.error("Error parsing balloonContent:", e);
                            }
                        }

                        // Update address data through callback
                        onAddressUpdate({
                            tuman: tuman,
                            kvartl: kvartl,
                            joylashuv: joylashuv
                        });
                    }
                } catch (error) {
                    console.error("Error processing geocoder response:", error);
                }
            }).catch(function (error) {
                console.error("Geocoder error:", error);
            });
        };

        // Load Yandex Maps script once
        const loadYandexMaps = () => {
            // ID for script to ensure it's added only once
            const scriptId = 'yandex-maps-script';

            // Check if script is already loaded
            if (window.ymaps) {
                console.log("Yandex Maps script already loaded");
                initializeMap();
                return;
            }

            // Check if script tag already exists
            if (document.getElementById(scriptId)) {
                console.log("Yandex Maps script tag already exists");
                return;
            }

            console.log("Loading Yandex Maps script...");
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=b9ebd171-d417-41a4-b7e4-f98bd13e02ac&lang=uz_UZ';
            script.async = true;
            script.onload = () => {
                console.log("Yandex Maps script loaded");
                initializeMap();
            };
            script.onerror = (e) => {
                console.error("Error loading Yandex Maps script:", e);
            };
            document.body.appendChild(script);
        };

        loadYandexMaps();

        // Cleanup
        return () => {
            if (yandexMapRef.current) {
                yandexMapRef.current.destroy();
                yandexMapRef.current = null;
            }
        };
    }, [initialLatitude, initialLongitude, onCoordinatesUpdate, onAddressUpdate]);

    return (
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Location on map
            </label>
            <p className="text-sm text-gray-500 mb-2">
                Select the desired location on the map
            </p>
            {/* Map container */}
            <div
                ref={mapRef}
                className="w-full h-96 rounded-lg border border-gray-300"
                style={{ minHeight: '400px' }}
            ></div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                    </label>
                    <input
                        type="text"
                        value={initialLatitude || ''}
                        className="w-full bg-gray-100 rounded-lg border border-gray-300 px-4 py-2"
                        readOnly
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                    </label>
                    <input
                        type="text"
                        value={initialLongitude || ''}
                        className="w-full bg-gray-100 rounded-lg border border-gray-300 px-4 py-2"
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
};

export default MapComponent;