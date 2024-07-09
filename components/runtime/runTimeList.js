import { useState, useEffect } from 'react';
import localeString from "@/lib/locale.json"
import moment from 'moment';
import { Button } from "@/components/ui/button";
import { CodeSnippetDialog } from "@/components/runtime/codeSnippetDialog";
import { cn } from "@/lib/utils";
import { FaNodeJs } from "react-icons/fa";
import Loader from "@/components/loader";
import { isMobile } from 'react-device-detect';
import { HeroPitch } from "@/components/setup/heroPitch";
import { MessageSquare } from 'lucide-react';
import ChatInterface from "@/components/chat/chatInterface";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer";

export default function RunTimeList(props) {
    const { runTimeResults, setRunTimeResults, locale, apiClient, profileId, channel , setChannel, SetUpPanel, anthropicApiKey, chatToken } = props;
    const [load, setLoad] = useState(false);
    const sendExampleMessage = async (message) => {
        try {
            setLoad(true);
            await channel.sendMessage({ text: message });   
            setTimeout(() => {
                setLoad(false); 
            }, 10000);
        } catch (error) {
            console.error('Error in sending message : ', error);
            setLoad(false);
        }
    };
    const LogosPython = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 255" {...props}>
            <defs>
                <linearGradient id="logosPython0" x1="12.959%" x2="79.639%" y1="12.039%" y2="78.201%">
                    <stop offset="0%" stopColor="#387EB8"></stop>
                    <stop offset="100%" stopColor="#366994"></stop>
                </linearGradient>
                <linearGradient id="logosPython1" x1="19.128%" x2="90.742%" y1="20.579%" y2="88.429%">
                    <stop offset="0%" stopColor="#FFE052"></stop>
                    <stop offset="100%" stopColor="#FFC331"></stop>
                </linearGradient>
            </defs>
            <path fill="url(#logosPython0)" d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072ZM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13a11.12 11.12 0 0 1-11.13 11.13a11.12 11.12 0 0 1-11.13-11.13a11.12 11.12 0 0 1 11.13-11.13Z"></path>
            <path fill="url(#logosPython1)" d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897Zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13a11.12 11.12 0 0 1 11.13-11.131a11.12 11.12 0 0 1 11.13 11.13a11.12 11.12 0 0 1-11.13 11.13Z"></path>
        </svg>
    );
    const runtTimeLogo = (runtime) => {
        if(runtime === "nodejs_runtime") return <FaNodeJs className='w-5 h-5 text-green-500'/>
        if(runtime === "python_runtime") return <LogosPython className='w-5 h-5'/>
        return null;
    }
    const templateMessages = [
        {
            title : localeString['templateMsg1'][locale],
            message: localeString['templateMsgDetail1'][locale],
            runtime: 'python_runtime'
        },
        {
            title : localeString['templateMsg2'][locale],
            message: localeString['templateMsgDetail2'][locale],
            runtime: 'nodejs_runtime'
        }
    ];
    if(isMobile) return <div className='w-full flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2'>
        {(chatToken && profileId && anthropicApiKey) ? <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="w-fit justify-start bg-black gap-2">
            <MessageSquare className="w-4 h-4 text-black dark:text-white" aria-hidden="true"/>
            <span>{localeString['chatWithCarpenter'][locale]}</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          {
            (load === true) ? <Loader format='list' /> :
              (chatToken && profileId && anthropicApiKey) ?
                <ChatInterface 
                  locale={locale} 
                  apiClient={apiClient} 
                  chatToken={chatToken} 
                  profileId={profileId} 
                  channel={channel}
                  setChannel={setChannel}
                /> :
                null
          }
        </DrawerContent>
      </Drawer> : SetUpPanel()}
    </div>;
    if(load === true && runTimeResults.length === 0) return <div className='w-full flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2'>
        <Loader/>
    </div>;
    if(!profileId) return <div className='w-full flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2'>
        {localeString['noRuntimeResult'][locale]}
    </div>;
    if (runTimeResults.length === 0) return <div className='w-full flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2'>
        {`${localeString['noRuntimeResult'][locale]} ${localeString['useMessageTemplate'][locale]}`}
        {
            templateMessages.map((templateMessage, index) => {
                // console.log('Template Message : ', templateMessage);
                return (
                    <Button 
                        key={index}
                        onClick={() => sendExampleMessage(templateMessage.message)}
                        className={`flex items-center gap-3 font-mono text-xs bg-black hover:bg-slate-900`}
                        variant={`outline`}
                    >
                        {runtTimeLogo(templateMessage.runtime)}
                        {templateMessage.title}
                    </Button>
                )
            })
        }
    </div>;
    return (
        <div className='w-full grid grid-cols-1 gap-2 h-auto max-h-[80dvh] overflow-y-auto'>
            {
                runTimeResults.map((runTimeResult, index) => {
                    let result = (runTimeResult.result) ? runTimeResult.result : null;
                    let error = (runTimeResult.result && runTimeResult.result.error) ? runTimeResult.result.error : null;
                    // Parse the result until execRes is not found
                    // if(runTimeResult.execRes) result = runTimeResult.execRes;
                    // if(result.execRes) result = result.execRes;
                    if(result) while (result.execRes) {
                        result = result.execRes;
                    }
                    if(result) while (result.exeRes) {
                        result = result.exeRes;
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
                                <p>{`${(error) ? error : (typeof result === 'object') ? JSON.stringify(result, null, 2) : result}`}</p>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}