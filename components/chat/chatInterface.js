import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
// import { AiOutlineClose } from 'react-icons/ai';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageList,
  VirtualizedMessageList,
  MessageInput,
  Thread,
  Window,
  useCreateChatClient
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
// import { ieStreamioAction } from '@/src/graphql/queries';
// import { getProfileByUserId, getWorkflowByProfileId, getProfile, getWorkflow } from "@/utils/customQueries";
import { cn } from "@/lib/utils";
import Loader from "@/components/loader";
// const filters = { type: 'messaging' };
const options = { state: true, presence: true, limit: 10 };
const sort = { last_message_at: -1 };

// const client = new StreamChat('bt3e2mj97jk3');


export default function ChatInterface(props){
    // console.log(props);
    const { locale, apiClient, profileId, chatToken, channel, setChannel } = props;
    const client = useCreateChatClient({
        apiKey: process.env.NEXT_PUBLIC_streamio_key,
        tokenOrProvider: chatToken,
        userData: { id: `user-${profileId}`, name: `user-${profileId}` }
    });
    // const [client, setClient] = useState(null);
    const [load, setLoad] = useState(false);
    // const { profile, displayWorkflow } = modal;
    // const [profile, setProfile] = useState(props.profile ? props.profile : null);
    // const [channel, setChannel] = useState(null);
    const [channelFilter, setChannelFilter] = useState(null);
    // const filters = { members: { $in: [`user-${profileId}`] } , type: 'messaging' };
    const [token, setToken] = useState(null);
    const [servant, setServant] = useState(null);
    const [servantsList, setServantsList] = useState(null);
    // const [theme, setTheme] = useState('dark');
    // const [servantToken, setServantToken] = useState(null);
    // const handleStreamIO = async (id,action) => {
    //     let params = { action: action };
    //     if(action === "generateToken") params.profileId = id;
    //     else if(action === "upsertUser") params.servantId = id;
    //     let handleRes = await API.graphql(graphqlOperation(ieStreamioAction, { params: JSON.stringify(params) }));
    //     handleRes = JSON.parse(handleRes.data.ieStreamioAction);
    //     return handleRes.body;
    // }
    // const setupStreamChat = async (profileId,servantId,workflowId,displayWorkflow) => {
    //     try {
    //         // Get the first nodes of the workflow which is the root servant with the servant id
    //         // console.log(displayWorkflow);
    //         // Upsert the servant to the streamio
    //         const servant = await handleStreamIO(servantId, "upsertUser");
    //         // console.log('res servant : ',servant);
    //         setServant(servant.users[`servant-${servantId}`]);
    //         // console.log(profile);
    //         let token;
    //         if(profile.data && !profile.data.streamIoToken) token = await handleStreamIO(profileId, "generateToken");
    //         if(profile.data && profile.data.streamIoToken) token = profile.data.streamIoToken;
    //         setToken(token);
    //         let servantsList = [];
    //         let workflow;
    //         if(workflowId && !displayWorkflow){
    //             workflow = await API.graphql(graphqlOperation(getWorkflow, { id: workflowId }));
    //             if(typeof workflow.data.getWorkflow.config === "string") workflow.data.getWorkflow.config = JSON.parse(workflow.data.getWorkflow.config);
    //             workflow = workflow.data.getWorkflow;
    //         }
    //         if(displayWorkflow) workflow = displayWorkflow;
    //         // console.log(workflow.data.getWorkflow.config.nodes);
    //         let getAllServantNodesServantIds = (workflow.config.nodes.filter((node) => node.data.type === 'servant')).map((node) => {
    //             return { id: node.data.servantId, name: node.data.servant && node.data.servant.title ? node.data.servant.title : node.data.servantId };
    //         });
    //         // Filter the out the servant.id === servantId from the list
    //         getAllServantNodesServantIds = getAllServantNodesServantIds.filter((servant) => servant.id !== servantId);
    //         servantsList = getAllServantNodesServantIds;
    //         setServantsList(servantsList);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    const createStramChannel = async (newClient,profileId) => {
        try {
            const createServantProfileChannel = async (profileId) => {
                console.log('Creating Channel',profileId);
                const servantId = `carpenter-${profileId.split('-')[0]}`;
                const channel = newClient.channel('messaging', `${profileId.split('-')[0]}-${servantId}`, {
                    members: [`user-${profileId}`, `carpenter-${profileId.split('-')[0]}`],
                    name: `Carpenter`,
                    servantId: servantId,
                    profileId: profileId
                });
                await channel.create();
                return channel;
            }
            // console.log(servant.id);
            const channel = await createServantProfileChannel(profileId);
            setChannel(channel);
            // console.log(servantsList);
            // await Promise.all(servantsList.map(async (servantItem) => {
            //     // console.log(servant);
            //     await handleStreamIO(servantItem.id, "upsertUser");
            //     // const servantItemChannel = 
            //     await createServantProfileChannel(`servant-${servantItem.id}`,profile.id,servantItem.name);
            //     // if(servant.id === servantItem.id) setServant(servantItemChannel);
            // }));
            setChannelFilter({ 
                type: 'messaging', 
                // members: { $in: [`user-${profile.id}`] }
                members: { $in: [`carpenter-${profileId.split('-')[0]}`] }
            });
            return channel;
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        if(client) createStramChannel(client,profileId);
    },[client]);
    // useEffect(()=>{
    //     const getUserProfile = async (userId,groups) => {    
    //         let profile = await API.graphql(graphqlOperation(getProfileByUserId, { userId: userId }));
    //         if(profile.data.getProfileByUserId.items[0].oauth) profile.data.getProfileByUserId.items[0].oauth = JSON.parse(profile.data.getProfileByUserId.items[0].oauth);
    //         if(profile.data.getProfileByUserId.items[0].data) profile.data.getProfileByUserId.items[0].data = JSON.parse(profile.data.getProfileByUserId.items[0].data);
    //         if(profile.data.getProfileByUserId.items[0].settings) profile.data.getProfileByUserId.items[0].settings = JSON.parse(profile.data.getProfileByUserId.items[0].settings);
    //         let allProfiles = [{
    //             id : profile.data.getProfileByUserId.items[0].id,
    //             origin: 'dashboard'
    //         }];
    //         setProfile({ ...profile.data.getProfileByUserId.items[0], systemRole: groups ? groups[0] : ['user'] , allProfiles : allProfiles, selectedProfile : profile.data.getProfileByUserId.items[0].id });
    //     };
    //     const checkAuth = async()=>{
    //         try {
    //             setLoad(true);
    //             const currentUser = await Auth.currentAuthenticatedUser();
    //             const groups = currentUser.signInUserSession.accessToken.payload['cognito:groups'];
    //             if(!currentUser){
    //                 router.push({ pathname : '/auth', query : { action : "login" } }); 
    //                 return;
    //             }
    //             if(currentUser){
    //                 getUserProfile(currentUser.username,groups);
    //                 // Check User Theme from local storage
    //                 let theme = await localStorage.getItem('theme');
    //                 // console.log('Theme : ',theme);
    //                 setTheme(theme ? theme : 'dark');
    //             }
    //         } catch (error) {
    //             router.push({ pathname : '/auth', query : { action : "login" } });    
    //         }
    //     }
    //     if(!profile) checkAuth();
    // },[]);
    // useEffect(() => {
    //     if(theme === 'dark') document.body.classList.add('dark');
    //     else document.body.classList.remove('dark');
    // },[theme]);
    // useEffect(() => {
    //     const servantId = router.query.servantId || props.servantId;
    //     const workflowId = router.query.workflowId || props.workflowId;
    //     if(profile) setupStreamChat(profile.id, servantId, workflowId, props.displayWorkflow);
    // }, [profile]);
    // useEffect(() => {
    //     if(!token || !profile || !servant || !servantsList) return;
    //     const newClient = new StreamChat(process.env.NEXT_PUBLIC_streamio_key);
    
    //     const handleConnectionChange = ({ online = false }) => {
    //       if (!online) return console.log('connection lost');
    //       setClient(newClient);
    //     };
    //     newClient.on('connection.changed', handleConnectionChange);
    //     newClient.connectUser(
    //         {
    //             id: `user-${profile.id}`,
    //             name: `${profile.data.enLastName || ``} ${profile.data.enFirstName || ``}`
    //         },
    //         token
    //     );
    //     // Remove all '-' from the id
    //     // console.log('Origin Profile',profile.id);
    //     // console.log('Origin Servant',servantId);
    //     // console.log(`${profile.id.replaceAll('-','')}${servantId.replaceAll('-','')}`);
    //     // console.log('ProfileID',profile.id.replaceAll('-','').length,profile.id.replaceAll('-',''));
    //     // console.log('ServantID',servantId.replaceAll('-','').length,servantId.replaceAll('-',''));
    //     createStramChannel(newClient,profile,servant,servantsList);
    //     // Create the channel if it doesn't exist
    //     // setChannel(channel);
    //     // console.log(channel);
    //     return () => {
    //       newClient.off('connection.changed', handleConnectionChange);
    //       newClient.disconnectUser().then(() => console.log('connection closed'));
    //     };
    // }, [token,profile,servant,servantsList]);
    if(!client) return <Loader format='list' />;
    return(
        <div className={cn(`bg-white dark:bg-black flex items-center justify-center w-full`, isMobile ? 'h-[60dvh]' : 'h-full')}>
            <div className='h-full w-full'>
                {(client && channelFilter) ? <Chat client={client} theme='str-chat__theme-dark' className='flex h-full w-full'>
                    <div className={`hidden`}>
                        <ChannelList
                            filters={channelFilter} 
                            sort={sort}
                            options={options}
                        />
                    </div>
                    <Channel>
                        <Window>
                            <ChannelHeader />
                            <MessageList/>
                            <MessageInput grow={true} />
                        </Window>
                    <Thread />
                    </Channel>
                </Chat> : <Loader format='list' />}
            </div>
        </div>
    )
}