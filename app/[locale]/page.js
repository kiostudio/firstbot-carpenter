'use client'

import Image from "next/image";
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { APIKeyDialog } from "@/components/key/apiKeyDialog";
import localeString from "@/lib/locale.json";
import LanguageMenu from "@/components/languageMenu";
import { Toaster } from "@/components/ui/toaster";
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import ChatInterface from "@/components/chat/chatInterface";
import Loader from "@/components/loader";
import { onCreateLogging } from '@/src/graphql/subscriptions';
import { firstbotAnthropicRuntime } from '@/src/graphql/queries';
import DarkLogo from "@/public/logo_dark.png";
import RunTimeList from "@/components/runtime/runTimeList";
import CopyRight from "@/components/copyRight";
import { Github } from 'lucide-react';
import { HeroPitch } from "@/components/setup/heroPitch";

Amplify.configure({
  aws_project_region: "us-east-1",
  aws_appsync_region: "us-east-1",
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_aws_appsync_graphqlEndpoint,
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: process.env.NEXT_PUBLIC_aws_appsync_apiKey,
});

const apiClient = generateClient();

export default function Home({ params }) {
  let locale = params.locale;
  const [open, setOpen] = useState(false)
  const [load, setLoad] = useState(true);
  const [chatToken, setChatToken] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [runTimeResults, setRunTimeResults] = useState([]);
  const [channel, setChannel] = useState(null);
  useEffect(() => {
    if (localStorage.getItem('stremioToken')) setChatToken(localStorage.getItem('stremioToken'));
    if (localStorage.getItem('profileId')) setProfileId(localStorage.getItem('profileId'));
    if (localStorage.getItem('anthropicApiKey')) setAnthropicApiKey(localStorage.getItem('anthropicApiKey'));
    setLoad(false);
  }, []);
  useEffect(() => {
    if (!profileId) return;
    if (!anthropicApiKey) return;
    const triggerAnthropicRuntime = async (messageData) => {
      const anthropicRuntime = await apiClient.graphql({ query: firstbotAnthropicRuntime, variables: { params: JSON.stringify({ messageData, anthropicApiKey, profileId }) } });
    };
    const variables = {
      filter: {
        profileId: { eq: profileId }
      }
    };
    const loggingSubscription = apiClient.graphql({
      query: onCreateLogging,
      variables
    }).subscribe({
      next: (eventData) => {
        // console.log('Event Data : ',eventData);
        let { data, type, createdAt, updatedAt } = eventData.data.onCreateLogging;
        const messageData = (typeof data === 'string') ? JSON.parse(data) : data;
        // console.log(eventData.data.onCreateLogging.profileId, profileId);
        if (eventData.data.onCreateLogging.profileId !== profileId) return;
        // console.log('Message Data : ',messageData);
        if (type === "clientSideAPIRequest") triggerAnthropicRuntime(messageData);
        if (type === "exeRuntime") {
          // console.log('Message Data : ',messageData);
          setRunTimeResults((prevRunTimeResults) => {
            return [{
              id: eventData.data.onCreateLogging.id,
              createdAt: createdAt,
              updatedAt: updatedAt,
              ...messageData
            }, ...prevRunTimeResults];
          });
        }
      },
      error: (error) => {
        console.log('Error : ', error);
      }
    });
  }, [profileId, anthropicApiKey]);
  const SetUpPanel = () => {
    return <div className='w-full h-full flex flex-col items-center justify-center gap-6'>
      {/* <div className="font-mono">{localeString['carpenterPitch'][locale]}</div> */}
      {/* <div>{localeString['setupApiKeyDesToUse'][locale]}</div> */}
      <HeroPitch locale={locale} />
      <APIKeyDialog locale={locale} apiClient={apiClient} setChatToken={setChatToken} setProfileId={setProfileId} anthropicApiKey={anthropicApiKey} setAnthropicApiKey={setAnthropicApiKey} />
    </div>;
  };
  const ChatInterfacePanel = () => {
    return <div className='w-full hidden md:flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-black'>
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
            SetUpPanel()
      }
    </div>
  }
  // const MobileChatInterfacePanel = () => {
  //   if(!anthropicApiKey) return null;
  //   return (
  //     <Drawer>
  //       <DrawerTrigger asChild>
  //         <Button variant="ghost" className="w-fit justify-start bg-black gap-2">
  //           <MessageSquare className="w-4 h-4 text-black dark:text-white" aria-hidden="true"/>
  //           <span>{localeString['chatWithCarpenter'][locale]}</span>
  //         </Button>
  //       </DrawerTrigger>
  //       <DrawerContent>
  //         {
  //           // (load === true) ? <Loader format='list' /> :
  //             (chatToken && profileId && anthropicApiKey) ?
  //               <ChatInterface 
  //                 locale={locale} 
  //                 apiClient={apiClient} 
  //                 chatToken={chatToken} 
  //                 profileId={profileId} 
  //                 channel={channel}
  //                 setChannel={setChannel}
  //               /> :
  //               null
  //         }
  //       </DrawerContent>
  //     </Drawer>
  //   )
  // }
  return (
    <main className={'w-full h-[100dvh] flex flex-col items-center justify-center overflow-auto'}>
      <div className='w-full flex flex-row items-start justify-start h-full'>
        <div className='w-full flex flex-col items-center justify-start p-5 h-full gap-5'>
          <div className='w-full flex flex-col items-center justify-start h-full gap-3'>
            <div className='w-full flex flex-row items-center justify-between h-fit'>
              <div className='w-auto flex flex-row items-center justify-between'>
                <a href={'https://firstbot.tech/'} target='_blank' rel='noreferrer'>
                  <Button className="flex items-center gap-3" variant='ghost'>
                    <Image src={DarkLogo} width={18} height={18} alt="logo" className='hidden dark:block' />
                    <div className='hidden lg:flex text-sm font-mono text-black dark:text-white'>{localeString['brand'][locale]}</div>
                  </Button>
                </a>
              </div>
              <div className={`relative w-auto flex flex-row items-center justify-between gap-2`}>
                <Button 
                  className="hidden md:flex items-center gap-3"
                  variant='ghost'
                  onClick={() => window.open(`https://github.com/kiostudio/firstbot-carpenter/fork`, '_blank')}
                >
                  <Github size={16} />
                  <span>{localeString['fork'][locale]}</span>
                </Button>
                <LanguageMenu locale={locale} />
                {(chatToken && profileId && anthropicApiKey) ? <APIKeyDialog locale={locale} apiClient={apiClient} setChatToken={setChatToken} setProfileId={setProfileId} anthropicApiKey={anthropicApiKey} setAnthropicApiKey={setAnthropicApiKey} /> : null}
              </div>
            </div>
            <RunTimeList runTimeResults={runTimeResults} setRunTimeResults={setRunTimeResults} locale={locale} apiClient={apiClient} profileId={profileId} channel={channel} SetUpPanel={SetUpPanel} anthropicApiKey={anthropicApiKey} setChannel={setChannel} chatToken={chatToken} />
          </div>
          <CopyRight />
        </div>
        {(isMobile) ? null : ChatInterfacePanel() }
      </div>
      <Toaster />
    </main>
  );
}