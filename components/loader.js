export default function Loader({ color , format = 'circle' }) {
    if(format === 'list'){
        return <div className='w-full h-full transition-all'>
            <div className='w-full h-full flex flex-col items-start justify-start space-y-3 p-5 rounded-lg shadow-lg'>
                <div className='w-full h-10 flex items-center justify-center rounded-md animate-pulse bg-gray-100 dark:bg-zinc-800'></div>
                <div className='w-full h-10 flex items-center justify-center rounded-md animate-pulse bg-gray-100 dark:bg-zinc-800'></div>
                <div className='w-full h-10 flex items-center justify-center rounded-md animate-pulse bg-gray-100 dark:bg-zinc-800'></div>
            </div>  
        </div>
    }
    return(
        <div>
            <svg className={`animate-spin h-5 w-5 ${(color) ? color : `text-gray-600`}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    )
}