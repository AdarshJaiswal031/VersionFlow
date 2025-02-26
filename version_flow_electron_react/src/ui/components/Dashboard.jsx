/* eslint-disable no-unused-vars */
import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import FileCard from './FileCard'

const Dashboard = () => {

    const handleFileOpenClick = () => {
        if (window.electron && window.electron.send) {
            window.electron.send("open-file")
        }
    }

    return (
        <div className="text-center bg-[#23282E] w-full h-full">
            <Navbar />
            <div className=' w-full h-11/12'>
                <div className='h-full w-3/12 bg-zinc-900'>
                    <div className='w-full h-full px-4 py-2'>
                        <button onClick={handleFileOpenClick} className='bg-blue-400 w-full h-10 rounded-sm cursor-pointer hover:bg-blue-500'><i className="ri-add-line text-white"></i></button>
                        <div className='w-full h-11/12 overflow-y-scroll mt-3 no-scrollbar'>
                            <FileCard filename="XDrop" commitTime="26/02/2025" />
                            <FileCard filename="Spring Security" commitTime="26/02/2025" />
                        </div>

                    </div>
                </div>
            </div>
        </div >
    )
}

export default Dashboard