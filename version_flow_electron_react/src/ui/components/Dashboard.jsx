/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import FileCard from './FileCard'
import FileEditor from './FileEditor'
import BlurryButton from './BlurryButton'
import VersionTimeline from './VersionTimeline'
import { useRecoilValue } from 'recoil'
import { filePathState } from '../recoil/filePathAtom'

const Dashboard = () => {
    const filePathRecoil = useRecoilValue(filePathState)
    const [versions, setVersions] = useState([])

    useEffect(() => {
        window.electron.on("get-versions", (response) => {
            if (response.success) {
                console.log("___________------", response.versions)
                setVersions(response.versions)
            }
        });
    }, [])


    const handleFileOpenClick = () => {
        // if (window.electron && window.electron.send) {
        //     console.log("open file exproler")
        //     window.electron.send("open-file")
        // }
    }
    const handleGetVersions = () => {
        console.log(filePathRecoil)
        window.electron.send("get-versions", { filePath: filePathRecoil })
    }


    return (
        <div className="text-center bg-zinc-900 w-full h-full">
            <Navbar />
            <div className=' w-full h-11/12 flex'>
                <div className='h-full w-3/12 bg-zinc-800 border-r-[1px] border-zinc-600 pt-2'>
                    <div className='w-full h-full px-4 py-2'>
                        <button onClick={handleFileOpenClick} className='
                        bg-blue-600 w-full h-10 rounded-sm cursor-pointer
                         hover:bg-blue-500 button-gradient'><i className="ri-add-line text-white"></i></button>
                        <div className='w-full h-11/12 overflow-y-scroll mt-3 no-scrollbar flex flex-col gap-3 mt-4'>
                            <FileCard filename="XDrop" commitTime="26/02/2025" />
                            <FileCard filename="Spring Security" commitTime="26/02/2025" />
                        </div>

                    </div>
                </div>
                <div className='h-full w-8/12'>
                    <FileEditor />
                </div>
                <div className='h-full px-4 gap-5 py-4 w-1/12 flex flex-col item-center bg-zinc-800 border-l-[1px] border-zinc-700'>
                    <BlurryButton className='text-white'>
                        <i onClick={handleGetVersions} className="ri-upload-cloud-line text-blue-500"></i></BlurryButton>
                    <BlurryButton className='h-5/6 flex flex-col items-center justify-start overflow-y-scroll no-scrollbar'>
                        <p className='text-zinc-400 text-xs'>Versions</p>
                        <hr className="w-full border-t border-zinc-600 mb-5 mt-1" />
                        <VersionTimeline versions={versions} />
                    </BlurryButton>
                </div>
            </div>
        </div >
    )
}

export default Dashboard