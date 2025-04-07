// YandexMapSingleton.js
// This file creates a singleton pattern for Yandex Maps to prevent multiple instances

class YandexMapManager {
    constructor() {
        this.instances = {};
        this.scriptLoaded = false;
        this.scriptLoading = false;
    }

    // Load the Yandex Maps script only once
    loadScript() {
        if (this.scriptLoaded || this.scriptLoading) {
            return Promise.resolve();
        }

        this.scriptLoading = true;
        return new Promise((resolve, reject) => {
            console.log("Loading Yandex Maps script...");
            const script = document.createElement('script');
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=b9ebd171-d417-41a4-b7e4-f98bd13e02ac&lang=ru_RU';
            script.async = true;

            script.onload = () => {
                console.log("Yandex Maps script loaded");
                this.scriptLoaded = true;
                this.scriptLoading = false;

                // Wait for ymaps to be ready
                window.ymaps.ready(() => {
                    resolve();
                });
            };

            script.onerror = (e) => {
                console.error("Error loading Yandex Maps script:", e);
                this.scriptLoading = false;
                reject(e);
            };

            document.body.appendChild(script);
        });
    }

    // Create a new map or return existing one for a container
    async createMap(containerId, options = {}) {
        // Ensure script is loaded
        await this.loadScript();

        // If this container already has a map, destroy it first
        if (this.instances[containerId]) {
            console.log(`Destroying existing map in container: ${containerId}`);
            this.instances[containerId].destroy();
            delete this.instances[containerId];
        }

        // Get container element
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id ${containerId} not found`);
            return null;
        }

        // Set default options
        const defaultOptions = {
            center: [41.311081, 69.240562], // Default to Tashkent
            zoom: 12,
            controls: ['zoomControl', 'searchControl']
        };

        // Create the map
        try {
            console.log(`Creating new map in container: ${containerId}`);
            const map = new window.ymaps.Map(container, { ...defaultOptions, ...options });
            this.instances[containerId] = map;
            return map;
        } catch (error) {
            console.error(`Error creating map in container ${containerId}:`, error);
            return null;
        }
    }

    // Add a placemark to a map
    addPlacemark(mapId, coords, options = {}) {
        const map = this.instances[mapId];
        if (!map) {
            console.error(`Map with id ${mapId} not found`);
            return null;
        }

        // Clear existing placemarks
        map.geoObjects.removeAll();

        // Create a new placemark
        const placemark = new window.ymaps.Placemark(coords, {
            hintContent: options.hintContent || 'Placemark',
            balloonContent: options.balloonContent
        }, {
            draggable: options.draggable || false,
            preset: options.preset || 'islands#redDotIcon'
        });

        // Add the placemark to the map
        map.geoObjects.add(placemark);
        return placemark;
    }

    // Destroy a specific map instance
    destroyMap(containerId) {
        if (this.instances[containerId]) {
            this.instances[containerId].destroy();
            delete this.instances[containerId];
            return true;
        }
        return false;
    }

    // Destroy all map instances
    destroyAllMaps() {
        Object.keys(this.instances).forEach(id => {
            this.instances[id].destroy();
        });
        this.instances = {};
    }
}

// Create and export the singleton instance
const mapManager = new YandexMapManager();
export default mapManager;