import BlurryButton from "./BlurryButton"

/* eslint-disable react/prop-types */
const FileCard = (props) => {
    return (
        //         <ul className='py-2 px-2 w-full h-16 bg-zinc-900 flex cursor-pointer
        //    custom-bg-blue'>
        <BlurryButton className='py-2 px-2 w-full h-16 flex cursor-pointer rounded-2xl'>
            <ul className='w-3/4 h-full'>
                <li className='text-s text-left text-zinc-400'>{props.filename}</li>
                <li className='text-xs text-left text-zinc-500'>Last commit : {props.commitTime}</li>
            </ul>
            <ul className='w-1/4 flex justify-end'>
                <li><i className="ri-aliens-line text-blue-400 text-lg"></i></li>
                <li><i className="ri-aliens-fill text-blue-400 text-lg hidden"></i></li>
            </ul>
        </BlurryButton>
    )
}

export default FileCard