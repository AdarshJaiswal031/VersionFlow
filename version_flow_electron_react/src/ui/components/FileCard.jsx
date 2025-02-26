/* eslint-disable react/prop-types */
const FileCard = (props) => {
    return (
        <ul className='py-2 px-2 w-full h-16 bg-zinc-800 flex cursor-pointer
    bg-opacity-40 backdrop-blur-md
     backdrop-brightness-75 backdrop-contrast-50 
     backdrop-drop-shadow-lg backdrop-hue-rotate-180
      mt-4 rounded-sm shadow-lg ring-1 ring-zinc-800 
      ring-opacity-40 before:content-[""] before:absolute before:inset-0 before:bg-[linear-gradient(to_left,rgba(59,130,246,0.4)_0%,rgba(0,0,0,0)_70%)] before:blur-lg'>
            <ul className='w-3/4 h-full'>
                <li className='text-s text-left text-zinc-400'>{props.filename}</li>
                <li className='text-xs text-left text-zinc-500'>Last commit : {props.commitTime}</li>
            </ul>
            <ul className='w-1/4 flex justify-end'>
                <li><i className="ri-aliens-line text-blue-400 text-lg"></i></li>
                <li><i className="ri-aliens-fill text-blue-400 text-lg hidden"></i></li>
            </ul>
        </ul>
    )
}

export default FileCard