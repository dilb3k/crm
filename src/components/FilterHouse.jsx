import React, { useState } from "react";

const FilterHouse = ({ onApplyFilter }) => {
    // Filter state
    const [filters, setFilters] = useState({
        nomi: "",
        kategoriya: "",
        min_narx: "",
        max_narx: "",
        min_xona: "",
        max_xona: "",
        qavat: "",
        min_maydon: "",
        max_maydon: "",
        created_at_min: "",
        created_at_max: "",
    });

    // Checkbox states for sending empty values
    const [sendEmpty, setSendEmpty] = useState({
        nomi: true,
        kategoriya: true,
        min_narx: true,
        max_narx: true,
        min_xona: true,
        max_xona: true,
        qavat: true,
        min_maydon: true,
        max_maydon: true,
        created_at_min: false,
        created_at_max: true,
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle checkbox changes
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSendEmpty((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    // Reset all filters
    const handleReset = () => {
        setFilters({
            nomi: "",
            kategoriya: "",
            min_narx: "",
            max_narx: "",
            min_xona: "",
            max_xona: "",
            qavat: "",
            min_maydon: "",
            max_maydon: "",
            created_at_min: "",
            created_at_max: "",
        });
        setSendEmpty({
            nomi: true,
            kategoriya: true,
            min_narx: true,
            max_narx: true,
            min_xona: true,
            max_xona: true,
            qavat: true,
            min_maydon: true,
            max_maydon: true,
            created_at_min: false,
            created_at_max: true,
        });
    };

    // Apply filter and pass filter data to parent
    const handleApplyFilter = () => {
        // Prepare filter data object, only including fields that should be sent
        const filterData = {};

        Object.keys(filters).forEach((key) => {
            // Only add to request if field has value or sendEmpty is true
            if (filters[key] || sendEmpty[key]) {
                filterData[key] = filters[key];
            }
        });

        onApplyFilter(filterData);
    };

    // Category options based on existing data
    const categories = ["kvartira", "uchastka", "noturarjoy", "Navastroyka", "Penhause"];

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="font-inter font-medium text-xl text-gray-900 mb-4">
                E'lonlarni filtrlash
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Nomi */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Uyning nomi yoki tuman
                    </label>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            name="nomi"
                            value={filters.nomi}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            placeholder="Nomi..."
                        />
                        <div className="flex items-center mt-1">
                            <input
                                type="checkbox"
                                id="nomi-checkbox"
                                name="nomi"
                                checked={sendEmpty.nomi}
                                onChange={handleCheckboxChange}
                                className="mr-2"
                            />
                            <label htmlFor="nomi-checkbox" className="text-xs text-gray-500">
                                Bo'sh qiymat yuborish
                            </label>
                        </div>
                    </div>
                </div>

                {/* Kategoriya */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategoriya
                    </label>
                    <div className="flex flex-col">
                        <select
                            name="kategoriya"
                            value={filters.kategoriya}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="">Tanlang</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center mt-1">
                            <input
                                type="checkbox"
                                id="kategoriya-checkbox"
                                name="kategoriya"
                                checked={sendEmpty.kategoriya}
                                onChange={handleCheckboxChange}
                                className="mr-2"
                            />
                            <label htmlFor="kategoriya-checkbox" className="text-xs text-gray-500">
                                Bo'sh qiymat yuborish
                            </label>
                        </div>
                    </div>
                </div>

                {/* Narx */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Narxi ($)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <input
                                type="number"
                                name="min_narx"
                                value={filters.min_narx}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Minimal"
                            />
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id="min_narx-checkbox"
                                    name="min_narx"
                                    checked={sendEmpty.min_narx}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                <label htmlFor="min_narx-checkbox" className="text-xs text-gray-500">
                                    Bo'sh
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <input
                                type="number"
                                name="max_narx"
                                value={filters.max_narx}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Maksimal"
                            />
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id="max_narx-checkbox"
                                    name="max_narx"
                                    checked={sendEmpty.max_narx}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                <label htmlFor="max_narx-checkbox" className="text-xs text-gray-500">
                                    Bo'sh
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Xonalar soni */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xonalar soni
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <input
                                type="number"
                                name="min_xona"
                                value={filters.min_xona}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Minimal"
                            />
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id="min_xona-checkbox"
                                    name="min_xona"
                                    checked={sendEmpty.min_xona}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                <label htmlFor="min_xona-checkbox" className="text-xs text-gray-500">
                                    Bo'sh
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <input
                                type="number"
                                name="max_xona"
                                value={filters.max_xona}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Maksimal"
                            />
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id="max_xona-checkbox"
                                    name="max_xona"
                                    checked={sendEmpty.max_xona}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                <label htmlFor="max_xona-checkbox" className="text-xs text-gray-500">
                                    Bo'sh
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Qavat */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qavat
                    </label>
                    <div className="flex flex-col">
                        <input
                            type="number"
                            name="qavat"
                            value={filters.qavat}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            placeholder="Qavat raqami"
                        />
                        <div className="flex items-center mt-1">
                            <input
                                type="checkbox"
                                id="qavat-checkbox"
                                name="qavat"
                                checked={sendEmpty.qavat}
                                onChange={handleCheckboxChange}
                                className="mr-2"
                            />
                            <label htmlFor="qavat-checkbox" className="text-xs text-gray-500">
                                Bo'sh qiymat yuborish
                            </label>
                        </div>
                    </div>
                </div>

                {/* Maydon */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maydon (m²)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <input
                                type="number"
                                name="min_maydon"
                                value={filters.min_maydon}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Minimal"
                            />
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id="min_maydon-checkbox"
                                    name="min_maydon"
                                    checked={sendEmpty.min_maydon}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                <label htmlFor="min_maydon-checkbox" className="text-xs text-gray-500">
                                    Bo'sh
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <input
                                type="number"
                                name="max_maydon"
                                value={filters.max_maydon}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Maksimal"
                            />
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id="max_maydon-checkbox"
                                    name="max_maydon"
                                    checked={sendEmpty.max_maydon}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                <label htmlFor="max_maydon-checkbox" className="text-xs text-gray-500">
                                    Bo'sh
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sana */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yaratilgan sana
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <input
                                type="date"
                                name="created_at_min"
                                value={filters.created_at_min}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id="created_at_min-checkbox"
                                    name="created_at_min"
                                    checked={sendEmpty.created_at_min}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                <label htmlFor="created_at_min-checkbox" className="text-xs text-gray-500">
                                    Bo'sh
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <input
                                type="date"
                                name="created_at_max"
                                value={filters.created_at_max}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id="created_at_max-checkbox"
                                    name="created_at_max"
                                    checked={sendEmpty.created_at_max}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                <label htmlFor="created_at_max-checkbox" className="text-xs text-gray-500">
                                    Bo'sh
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end mt-4 space-x-3">
                <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Tozalash
                </button>
                <button
                    onClick={handleApplyFilter}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-green-400 text-white rounded-lg"
                >
                    Qo'llash
                </button>
            </div>
        </div>
    );
};

export default FilterHouse;