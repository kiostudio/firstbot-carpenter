import { useState, useEffect } from 'react';
import localeString from "@/lib/locale.json"
import moment from 'moment';
import { FaPython, FaNodeJs } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { CodeSnippetDialog } from "@/components/runtime/codeSnippetDialog";

export default function RunTimeList(props) {
    const { runTimeResults, setRunTimeResults, locale } = props;
    if (runTimeResults.length === 0) return <div className='w-full flex flex-row items-center justify-center h-full'>{localeString['noRuntimeResult'][locale]}</div>;
    const runtTimeLogo = (runtime) => {
        if(runtime === "nodejs_runtime") return <FaNodeJs className='w-5 h-5 text-green-500'/>
        if(runtime === "python_runtime") return <FaPython className='w-5 h-5 text-yellow-500'/>
        return null;
    }
    return (
        <div className='w-full grid grid-cols-2 gap-2 h-auto max-h-[80dvh] overflow-auto'>
            {
                runTimeResults.map((runTimeResult, index) => {
                    // console.log('Run Time Result : ', runTimeResult);
                    let result = (runTimeResult.result) ? runTimeResult.result : null;
                    let error = (runTimeResult.error) ? runTimeResult.error : null;
                    // Parse the result until execRes is not found
                    // if(runTimeResult.execRes) result = runTimeResult.execRes;
                    // if(result.execRes) result = result.execRes;
                    if(result) while (result.execRes) {
                        result = result.execRes;
                    }
                    return (
                        <div key={index} className='w-full flex flex-col items-start justify-start gap-2 p-4 border bg-slate-800 rounded-lg text-sm h-fit'>
                            <div className='w-full flex flex-row items-center justify-between gap-2'>
                                <div className='w-auto flex flex-row items-center justify-center gap-2 '>{`ID : ${runTimeResult.id.split('-')[0]}`}{runtTimeLogo(runTimeResult.runtime)}</div>
                                <CodeSnippetDialog locale={locale} runTimeResult={runTimeResult} />
                            </div>
                            <div className='w-auto flex flex-row items-center justify-start gap-2 '>
                                {`${localeString['time'][locale]} : ${moment(runTimeResult.createdAt).format('DD MMM YYYY HH:mm:ss')}`}
                            </div>
                            <div className='w-full flex flex-col items-start justify-start gap-2 '>
                                <div>{`${localeString['result'][locale]} : `}</div>
                                <div className='w-full flex flex-row items-center justify-start gap-2 bg-black p-3 rounded-md font-mono'>
                                    {`${result}`}
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}