import { useState, useEffect } from "react";
import BlurryButton from "./BlurryButton";
import { useSetRecoilState } from "recoil";
import { filePathState } from "../recoil/filePathAtom";

const FileEditor = () => {
    const [filePath, setFilePath] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false)
    const [isCommiting, setIsCommiting] = useState(false)
    const setFilePathRecoil = useSetRecoilState(filePathState)

    useEffect(() => {
        window.electron.on("open-file", (file) => {
            if (file) {
                setFilePath(file.path);
                setContent(file.content);
                setFilePathRecoil(file.path)
            }
        });
        window.electron.on("commit-success", (response) => {
            if (response.success) {
                setIsCommiting(false)
            } else {
                setIsSaving(false)
            }
        });
        window.electron.on("recreate-version", (response) => {
            if (response.success) {
                setContent(response.recreatedContent)
            } else {
                setIsSaving(false)
            }
        });

        window.electron.on("save-file", (response) => {
            if (response.success) {
                setIsSaving(false)
            } else {
                setIsSaving(false)
            }
        });
    }, []);

    const handleOpenFile = () => {
        window.electron.send("open-file");
    };

    const handleSaveFile = () => {
        setIsSaving(true);
        window.electron.send("save-file", { filePath, content });
    };

    const handleCommit = () => {
        setIsCommiting(true)
        handleSaveFile();
        window.electron.send("commit-file", { filePath: filePath, content });
    };
    const handleRecreate = () => {
        window.electron.send("recreate-version", { filePath: filePath, content });
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white p-6">
            {/* Buttons */}
            <BlurryButton className="mb-4 flex w-full h-10 justify-start items-center hover:bg-zinc-700/50">
                <i onClick={handleRecreate} className="ri-file-download-line text-zinc-500 border-r-2 border-r-zinc-600 pr-2 cursor-pointer hover:text-white transition-all delay-75"></i>
                <i onClick={handleOpenFile} className="ri-file-download-line text-zinc-500 border-r-2 border-r-zinc-600 pr-2 cursor-pointer hover:text-white transition-all delay-75"></i>
                <div className="border-r-2 border-r-zinc-600 pr-2 overflow-visible">
                    {!isSaving && <i onClick={handleSaveFile} className="ri-save-line text-zinc-500 cursor-pointer hover:text-white transition-all delay-75"></i>}
                    {isSaving && <i className={`ri-loader-4-line text-green-400 animate-spin inline-block`}></i>}
                </div>
                <div className="border-r-2 border-r-zinc-600 pr-2 overflow-visible">
                    {!isCommiting && <i onClick={handleCommit} className="ri-git-repository-commits-line text-zinc-500 cursor-pointer hover:text-white transition-all delay-75"></i>}
                    {isCommiting && <i className={`ri-loader-4-line text-green-400 animate-spin inline-block`}></i>}

                </div>
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
