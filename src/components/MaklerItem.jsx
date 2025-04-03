import React from "react";

// Format the bio text with line breaks
const formatBioText = (text) => {
    return text.split('\n').map((line, index) => (
        <p key={index} className="mb-2 text-gray-700">{line}</p>
    ));
};

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
    onDrop
}) => {
    return (
        <div
            data-makler-id={makler.id}
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
                            src={makler.photo ? `https://fast.uysavdo.com/uploads/${makler.photo}` : "https://via.placeholder.com/56"}
                            alt={makler.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/56"; }}
                        />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800 text-lg">{makler.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span>{makler.phone}</span>
                            <span className="mx-2">•</span>
                            <div className="flex items-center">
                                <span className="font-medium">{makler.rating ? makler.rating.toFixed(1) : "0.0"}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center">
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
                                src={makler.photo ? `https://fast.uysavdo.com/uploads/${makler.photo}` : "https://via.placeholder.com/192"}
                                alt={makler.name}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/192"; }}
                            />
                        </div>
                    </div>

                    {/* Makler details */}
                    <div className="space-y-4">
                        {/* Experience */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <span className="text-gray-500 font-medium">Tajriba</span>
                            <span className="text-right font-semibold text-gray-800">{makler.expiriense} yil</span>
                        </div>

                        {/* Bio */}
                        <div className="pt-2">
                            <div className="mb-2">
                                <span className="text-gray-500 font-medium">Izoh</span>
                            </div>
                            <div className="mt-2 text-gray-700">
                                {formatBioText(makler.bio || "Ma'lumot mavjud emas")}
                            </div>
                        </div>

                        {/* Call Button */}
                        <a
                            href={`tel:${makler.phone}`}
                            className="block w-full py-3 mt-6 text-center text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-shadow"
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
    );
};

export default MaklerItem;