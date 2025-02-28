/* eslint-disable react/prop-types */

const BlurryButton = ({ children, icon: Icon, className = "", ...props }) => {
    return (
        <button
            className={`relative px-4 py-2 rounded-lg backdrop-blur-xl bg-zinc-700/50 
                  hover:bg-zinc-700/70 transition duration-300 shadow-lg 
                  ring-1 ring-zinc-600/50 flex items-center justify-center gap-2 ${className}`}
            {...props}
        >
            {Icon && <Icon className="w-5 h-5" />}
            {children}
        </button>
    );
};

export default BlurryButton;
