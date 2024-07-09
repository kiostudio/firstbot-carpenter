import { useState, useEffect } from 'react';
import localeString from "@/lib/locale.json"
import moment from 'moment';
import { Button } from "@/components/ui/button";
import { CodeSnippetDialog } from "@/components/runtime/codeSnippetDialog";
import { cn } from "@/lib/utils";

export default function RunTimeList(props) {
    const { runTimeResults, setRunTimeResults, locale, apiClient, profileId } = props;
    if (runTimeResults.length === 0) return <div className='w-full flex flex-row items-center justify-center h-full text-gray-500 text-sm'>
        {localeString['noRuntimeResult'][locale]}
        {/* <Button onClick={() => {}}>{`Example`}</Button> */}
    </div>;
    return (
        <div className='w-full grid grid-cols-1 gap-2 h-auto max-h-[80dvh] overflow-y-auto'>
            {
                runTimeResults.map((runTimeResult, index) => {
                    // console.log('Run Time Result : ', runTimeResult,index);
                    let result = (runTimeResult.result) ? runTimeResult.result : null;
                    let error = (runTimeResult.result && runTimeResult.result.error) ? runTimeResult.result.error : null;
                    // Parse the result until execRes is not found
                    // if(runTimeResult.execRes) result = runTimeResult.execRes;
                    // if(result.execRes) result = result.execRes;
                    if(result) while (result.execRes) {
                        result = result.execRes;
                    }
                    return (
                        <div key={index} className='w-full flex flex-col items-start justify-start gap-2 p-4 border bg-slate-800 rounded-lg text-sm h-auto'>
                            <div className='w-full flex flex-row items-center justify-between gap-2'>
                                <div className="w-full flex flex-row items-center justify-start gap-2">
                                    <div className={cn(`w-fit flex flex-row items-center justify-start gap-2 p-2 rounded-md text-xs ${error ? 'bg-red-600' : 'bg-green-600'}`)}>{`${localeString[(error) ? 'error' :'success'][locale]}`}</div>
                                    <div className='w-auto flex flex-row items-center justify-center gap-2 '>{`ID : ${runTimeResult.id.split('-')[0]}`}</div>
                                </div>
                                <div className='w-auto flex flex-row items-center justify-start gap-2 '>
                                    <CodeSnippetDialog locale={locale} runTimeResult={runTimeResult} apiClient={apiClient} profileId={profileId} />
                                </div>
                            </div>
                            <div className='w-auto flex flex-row items-center justify-start gap-2 '>
                                {`${localeString['time'][locale]} : ${moment(runTimeResult.createdAt).format('DD MMM YYYY HH:mm:ss')}`}
                            </div>
                            <div className='w-full h-full flex flex-row items-center justify-start gap-2 bg-black p-3 rounded-md font-mono overflow-auto'>
                                <p>{`${(error) ? error : result}`}</p>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}