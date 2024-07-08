import { FaCopy } from "react-icons/fa";
import localeString from "@/lib/locale.json";

export default function CopyBtn({ toast, value , locale}) {
    return <button
        onClick={()=>{
            // Copy to clipboard
            navigator.clipboard.writeText(value);
            if(toast) toast({ title: localeString['info'][locale], description: localeString['copiedToClipboard'][locale] });
        }}
        className={`flex flex-row text-gray-400 hover:text-gray-800 active:text-gray-600 transition-all ease-in-out`}
    >
        <FaCopy className="ml-2 w-4 h-4" aria-hidden="true"/>
    </button>
}