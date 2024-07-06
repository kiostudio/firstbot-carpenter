import { useState, useEffect } from 'react';
import localeString from "@/lib/locale.json"
import moment from 'moment';

export default function RunTimeList(props) {
    const { runTimeResults, setRunTimeResults, locale } = props;
    if (runTimeResults.length === 0) return <div className='w-full flex flex-row items-center justify-center h-full'>{localeString['noRuntimeResult'][locale]}</div>;
    return (
        <div className='w-full grid grid-cols-2 gap-2'>
            {
                runTimeResults.map((runTimeResult, index) => {
                    console.log('Run Time Result : ', runTimeResult);
                    let result = runTimeResult.execRes;
                    // Parse the result until execRes is not found
                    // if(runTimeResult.execRes) result = runTimeResult.execRes;
                    // if(result.execRes) result = result.execRes;
                    while (result.execRes) {
                        result = result.execRes;
                    }
                    return (
                        <div key={index} className='w-full flex flex-col items-start justify-start gap-2 p-4 border bg-black rounded-lg text-sm'>
                            <div className='w-auto flex flex-row items-center justify-start gap-2 '>
                                {`ID : ${runTimeResult.id.split('-')[0]}`}
                            </div>
                            <div className='w-auto flex flex-row items-center justify-start gap-2 '>
                                {`${localeString['time'][locale]} : ${moment(runTimeResult.createdAt).format('DD MMM YYYY HH:mm:ss')}`}
                            </div>
                            <div className='w-auto flex flex-row items-center justify-start gap-2'>
                                {`${localeString['result'][locale]} : ${result}`}
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}