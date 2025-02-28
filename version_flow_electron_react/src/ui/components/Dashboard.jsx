/* eslint-disable no-unused-vars */
import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import FileCard from './FileCard'
import FileEditor from './FileEditor'
import BlurryButton from './BlurryButton'
import VersionTimeline from './VersionTimeline'

const Dashboard = () => {

    const versions = [
        { version: "v1.0", time: "Jan 10, 2024" },
        { version: "v1.1", time: "Feb 5, 2024" },
        { version: "v2.0", time: "Mar 20, 2024" },
        { version: "v2.1", time: "Apr 15, 2024" },
    ];

    const handleFileOpenClick = () => {
        // if (window.electron && window.electron.send) {
        //     console.log("open file exproler")
        //     window.electron.send("open-file")
        // }
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
                        <i className="ri-upload-cloud-line text-blue-500"></i></BlurryButton>
                    <BlurryButton className='h-3/4 flex flex-col items-center justify-start'>
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