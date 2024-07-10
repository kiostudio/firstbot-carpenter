'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import localeString from "@/lib/locale.json"
import { useToast } from "@/components/ui/use-toast"
import Loader from "@/components/loader"
import { createProfile } from "@/src/graphql/mutations";
import { firstbotStreamioAction } from "@/src/graphql/queries";
import { SquareArrowOutUpRight } from 'lucide-react';


export function APIKeyDialog({locale,apiClient,setChatToken,setProfileId, anthropicApiKey, setAnthropicApiKey}) {
    const { toast } = useToast();
    const [load, setLoad] = useState(false);
    const [open, setOpen] = useState(false);
    const storeApiKey = async(anthropicApiKey) => {
        try {
            setLoad(true);
            if(anthropicApiKey === '') throw new Error('emptyStringErr');
            // Check whether the key is valid : length, make sure include ant-api
            if(!anthropicApiKey.includes('ant-api')) throw new Error('invalidApiKeyErr');
            if(anthropicApiKey.length !== 108) throw new Error('invalidApiKeyErr');
            // Check localStorage profileId exists
            let localStorageProfileId = localStorage.getItem('profileId');
            if(!localStorageProfileId) {
                // Create a profile in the database
                const profile = { data: JSON.stringify({ anthropicApiKey: true }) }
                const createProfileRes = await apiClient.graphql({ query: createProfile, variables: { input: profile } });
                // console.log(createProfileRes);
                // Store the profile id in local storage
                localStorage.setItem('profileId', createProfileRes.data.createProfile.id);
                localStorageProfileId = createProfileRes.data.createProfile.id;
                setProfileId(createProfileRes.data.createProfile.id);
            }
            // Generate a chat token and store it in local storage
            let generateStreamIOTokenParams = { action: 'generateToken', profileId: localStorageProfileId };
            let generateStreamIOTokenRes = await apiClient.graphql({ query: firstbotStreamioAction, variables: { params: JSON.stringify(generateStreamIOTokenParams) } });
            if(generateStreamIOTokenRes.data.firstbotStreamioAction){
                // Parse the token and store it in local storage
                generateStreamIOTokenRes.data.firstbotStreamioAction = JSON.parse(generateStreamIOTokenRes.data.firstbotStreamioAction);
                // console.log(generateStreamIOTokenRes.data.firstbotStreamioAction.body);
                localStorage.setItem('stremioToken', generateStreamIOTokenRes.data.firstbotStreamioAction.body);
                setChatToken(generateStreamIOTokenRes.data.firstbotStreamioAction.body);
            }
            // Store the key in local storage
            localStorage.setItem('anthropicApiKey',anthropicApiKey);
            // Close the dialog
            setOpen(false);
            toast({
                title: localeString['success'][locale],
                description: localeString['apiKeySaved'][locale]
            })
        } catch (error) {
            console.error(error)
            toast({
                variant: 'destructive',
                title: localeString['error'][locale],
                description: localeString[error.message] ? localeString[error.message][locale] : error.message
            })
        } finally {
            setLoad(false);
        }
    };
    // const getApiKey = async() => {
    //     try {
    //         const getLocalAnthropicApiKey = localStorage.getItem('anthropicApiKey');
    //         // console.log(getLocalAnthropicApiKey);
    //         if(getLocalAnthropicApiKey) setAnthropicApiKey(getLocalAnthropicApiKey);
    //     } catch (error) {
    //         console.error(error)
    //         toast({
    //             variant: 'destructive',
    //             title: localeString['error'][locale],
    //             description: localeString[error.message] ? localeString[error.message][locale] : error.message
    //         })
    //     }
    // }
    // useEffect(() => {
    //     if(open === true) getApiKey();
    // }, [open]);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline" className="gap-1">
                <span>{`${localeString['setup'][locale]}`}</span>
                <span className="hidden md:block">{`Anthropic`}</span>
                <span>{`${localeString['apiKey'][locale]}`}</span>
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md gap-5">
            <DialogHeader>
            <DialogTitle>{localeString['bringYourOwnKey'][locale]}</DialogTitle>
            <DialogDescription>
                <div className="flex flex-col gap-2">
                    <span>{localeString['bringYourOwnKeyDescription'][locale]}</span>
                    <a className="text-blue-500 hover:underline gap-2 flex flex-row items-center" href={`https://docs.anthropic.com/en/docs/quickstart#set-your-api-key`} target="_blank" rel="noreferrer">
                        <SquareArrowOutUpRight size={16} />
                        {localeString['howToSetupAnthropicAPIKey'][locale]}
                    </a>
                    <a className="text-blue-500 hover:underline gap-2 flex flex-row items-center" href={`https://app.firstbot.tech/privacypolicy`} target="_blank" rel="noreferrer">
                        <SquareArrowOutUpRight size={16} />
                        {localeString['privacyPolicy'][locale]}
                    </a>
                </div>
            </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                {localeString['apiKey'][locale]}
                </Label>
                <Input
                    id="link"
                    type="text"
                    defaultValue={anthropicApiKey}
                    placeholder="API Key"
                    className="w-full"
                    onChange={event =>setAnthropicApiKey(event.currentTarget.value)}
                />
            </div>
            {/* <Button type="submit" size="sm" className="px-3">
            </Button> */}
            </div>
            <DialogFooter className="justify-end">
                <Button 
                    type="submit" 
                    variant="secondary"
                    disabled={load}
                    onClick={() => storeApiKey(anthropicApiKey)}
                >
                    {(load === false) ? localeString['save'][locale] : <Loader />}
                </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
