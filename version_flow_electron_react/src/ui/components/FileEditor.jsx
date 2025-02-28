import { useState, useEffect } from "react";
import BlurryButton from "./BlurryButton";

const FileEditor = () => {
    const [filePath, setFilePath] = useState("");
    const [content, setContent] = useState("");
    const [saveBtn, setSaveBtn] = useState("Save File")
    const [isSaving, setIsSaving] = useState(false)


    useEffect(() => {
        window.electron.on("open-file", (file) => {
            if (file) {
                setFilePath(file.path);
                setContent(file.content);
            }
        });

        window.electron.on("save-file", (response) => {
            if (response.success) {
                setSaveBtn("Saved!!")
                setTimeout(() => {
                    setSaveBtn("Save File")
                    setIsSaving(false)
                }, 1000)
            } else {
                alert("File save canceled.");
                setIsSaving(false)
            }
        });
        console.log("triggered")
    }, []);

    const handleOpenFile = () => {
        window.electron.send("open-file");
    };

    const handleSaveFile = () => {
        setIsSaving(true);
        window.electron.send("save-file", { filePath, content });
    };

    const handleCommit = () => {
        handleSaveFile();
        window.electron.send("commit-file", { filePath: filePath, content });
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white p-6">
            {/* Buttons */}
            <BlurryButton className="mb-4 flex w-full h-10 justify-start items-center hover:bg-zinc-700/50">
                <i onClick={handleOpenFile} className="ri-file-download-line text-zinc-500 border-r-2 border-r-zinc-600 pr-2 cursor-pointer hover:text-white transition-all delay-75"></i>
                <div className="border-r-2 border-r-zinc-600 pr-2 overflow-visible">
                    {!isSaving && <i onClick={handleSaveFile} className="ri-save-line text-zinc-500 cursor-pointer hover:text-white transition-all delay-75"></i>}
                    {isSaving && <i className={`ri-loader-4-line text-green-400 animate-spin inline-block`}></i>}
                </div>
                <i onClick={handleCommit} className="ri-git-repository-commits-line text-zinc-500 border-r-2 border-r-zinc-600 pr-2 cursor-pointer hover:text-white transition-all delay-75"></i>
                {filePath && <p className=" text-zinc-500 text-sm">{filePath}</p>}
            </BlurryButton>

            {/* File Path */}

            {/* Editor */}
            <textarea
                className="w-full h-[500px] p-4 text-white bg-zinc-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-zincs-500 "
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                }}
            ></textarea>
        </div>
    );
};

export default FileEditor;
