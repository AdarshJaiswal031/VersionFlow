/* eslint-disable react/prop-types */
import { useState } from "react";

const VersionTimeline = ({ versions }) => {
    const [hoveredVersion, setHoveredVersion] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);

    return (
        <div className="flex flex-col items-center relative gap-5">
            {versions.map((version, index) => (
                <div
                    key={index}
                    className="relative flex items-center gap-4 group"
                    onMouseEnter={() => setHoveredVersion(index)}
                    onMouseLeave={() => setHoveredVersion(null)}
                >
                    {/* Version Details (On Hover - Left Side) */}
                    <div
                        className={`absolute -left-40 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-md shadow-lg text-xs bg-zinc-900 text-white transition-all duration-300 
                        ${hoveredVersion === index ? "opacity-100 scale-100" : "opacity-0 scale-90"}`
                        }
                    >
                        {version.version} - {version.time}
                    </div>

                    {/* Version Circle */}
                    <div
                        onClick={() => setSelectedVersion(index)}
                        className={`w-6 h-6 rounded-full cursor-pointer backdrop-blur-md 
                        border-2 transition-all relative flex items-center justify-center
                        ${selectedVersion === index
                                ? "bg-blue-500 border-blue-500 shadow-[0_0_10px_#3b82f6]"
                                : "bg-zinc-600 border-gray-500 hover:border-blue-400 hover:shadow-[0_0_10px_#3b82f6]"
                            }`}
                    ></div>

                    {/* Connecting Line (Below Circle) */}
                    {index !== versions.length - 1 && (
                        <div className="absolute left-1/2 top-7 w-[1.5px] h-14 bg-zinc-600 z-[-1]"></div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default VersionTimeline;
