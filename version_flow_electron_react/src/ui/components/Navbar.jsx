

const Navbar = () => {
    return (
        <ul className='border-b-[1px] border-zinc-700 w-full h-1/12 bg-zinc-800 backdrop-blur-3xl flex items-center justify-between px-6'>
            <li className='flex gap-3 items-center'>
                <i className="ri-blaze-fill text-2xl text-gradient"></i>
                {/* <i className="ri-exchange-2-fill text-2xl text-gradient"></i> */}
                <p className='text-sm text-white'>Version Flow</p></li>
            <li className='w-1/2'>
                <input className='text-sm bg-zinc-800 w-full px-5 py-1 rounded-sm
        placeholder-zinc-300 text-white outline-none  border-[1px] border-zinc-700'
                    type="text" name="" id="" placeholder='Search file with file names' />
            </li>
            <li className='text-white relative right-40 rounded-full bg-zinc-800 py-1 px-2'>AJ</li>
        </ul>
    )
}

export default Navbar