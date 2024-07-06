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
  const [load, setLoad] = useState(true);
  const [chatToken,setChatToken] = useState(null);
  const [profileId,setProfileId] = useState(null);
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  useEffect(() => {
    if(localStorage.getItem('stremioToken')) setChatToken(localStorage.getItem('stremioToken'));
    if(localStorage.getItem('profileId')) setProfileId(localStorage.getItem('profileId'));
    if(localStorage.getItem('anthropicApiKey')) setAnthropicApiKey(localStorage.getItem('anthropicApiKey'));
    setLoad(false);
  },[]);
  useEffect(() => {
    if(!profileId) return;
    if(!anthropicApiKey) return;
    const triggerAnthropicRuntime = async (messageData) => {
      const anthropicRuntime = await apiClient.graphql({ query: firstbotAnthropicRuntime, variables: { params: JSON.stringify({ messageData, anthropicApiKey , profileId }) } });
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
        console.log('Event Data : ',eventData);
        let { data, type } = eventData.data.onCreateLogging;
        const messageData = (typeof data === 'string') ? JSON.parse(data) : data;
        // console.log(eventData.data.onCreateLogging.profileId, profileId);
        if(eventData.data.onCreateLogging.profileId !== profileId) return;
        if(type === "clientSideAPIRequest") triggerAnthropicRuntime(messageData);
      },
      error: (error) => {
        console.log('Error : ',error);
      }
    });
}, [profileId,anthropicApiKey]);
  return (
    <main className={'w-full h-[100dvh] flex flex-col items-center justify-center overflow-auto'}>
      <div className='w-full flex flex-row items-start justify-start h-full'>
        <div className='w-full flex flex-col items-center justify-center p-5'>
          <div className='w-full flex flex-row items-center justify-between h-fit'>
            <div className='w-auto flex flex-row items-center justify-between gap-3'>
                <Link href={'/'}>
                    <Button className="flex items-center gap-3" variant='ghost'>
                        <Image src={DarkLogo} width={18} height={18} alt="logo" className='hidden dark:block'/>
                        <div className='hidden lg:flex text-sm font-mono text-black dark:text-white'>{localeString['brand'][locale]}</div>
                    </Button>
                </Link>
            </div>
            <div className={`relative w-auto flex flex-row items-center justify-between gap-2`}>
              <LanguageMenu locale={locale} />
              <APIKeyDialog locale={locale} apiClient={apiClient} setChatToken={setChatToken} setProfileId={setProfileId} anthropicApiKey={anthropicApiKey} setAnthropicApiKey={setAnthropicApiKey}/>
            </div>
          </div>
          <div className='w-full grid grid-cols-2 gap-2'>

          </div>
        </div>
        <div className='w-full flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-black'>
            {
              (load === true) ? <Loader format='list' /> :
              (chatToken && profileId && anthropicApiKey) ? 
                <ChatInterface locale={locale} apiClient={apiClient} chatToken={chatToken} profileId={profileId} /> : 
                <div className='w-full h-full flex flex-col items-center justify-center gap-2'>
                  <div>{localeString['setupApiKeyDesToUse'][locale]}</div>
                  <APIKeyDialog locale={locale} apiClient={apiClient} setChatToken={setChatToken} setProfileId={setProfileId} anthropicApiKey={anthropicApiKey} setAnthropicApiKey={setAnthropicApiKey}/>
                </div>
            }
        </div>
      </div>
      <Toaster />
    </main>
  );
}
