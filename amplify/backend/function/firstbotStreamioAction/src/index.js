/* Amplify Params - DO NOT EDIT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIIDOUTPUT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT *//*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["STREAM_IO_SECRET_KEY"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
const StreamChat = require('stream-chat').StreamChat;
const aws = require('aws-sdk');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// const getServant = /* GraphQL */ `
//   query GetServant($id: ID!) {
//     getServant(id: $id) {
//       id
//       title
//       config
//     }
//   }
// `;

// const getTemplate = /* GraphQL */ `
//   query GetTemplate($id: ID!) {
//     getTemplate(id: $id) {
//       id
//       createdAt
//       metadata
//     }
//   }
// `;

// const getProfile = /* GraphQL */ `
//   query GetProfile($id: ID!) {
//     getProfile(id: $id) {
//       id
//       createdAt
//       updatedAt
//       data
//     }
//   }
// `;

// const updateProfile = /* GraphQL */ `
//   mutation UpdateProfile(
//     $input: UpdateProfileInput!
//     $condition: ModelProfileConditionInput
//   ) {
//     updateProfile(input: $input, condition: $condition) {
//       id
//       createdAt
//       updatedAt
//       data
//     }
//   }
// `;

const apiCallRequest = async function (variables,graphQuery,graphQueryName,graphqlEndpoint,graphqlApiKey) {
    try {
        const options = {
        method: 'POST',
        headers: {
            'x-api-key': graphqlApiKey
        },
        body: JSON.stringify({ query:graphQuery, variables:variables })
        };
        const request = new fetch.Request(graphqlEndpoint, options);
        // console.log('request: ',request);
        response = await fetch(request);
        body = await response.json();
        // console.log('body: ',body.data);
        if (body.errors) {
            console.log(`Error Happens in ${graphQueryName}:`,body.errors);
            return body.errors;
        }
        return body.data[graphQueryName];
    } catch (error) {
        console.log(`Error Happens in ${graphQueryName}:`,error);
        return error;
    }
}

/**`
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    try {
        // IF there is an argument, parse it || Or find the parameters in the body
        let params;
        console.log(event.arguments, typeof event.arguments);
        console.log(event.body, typeof event.body);
        if(event.arguments) params = JSON.parse(event.arguments.params);
        else params = JSON.parse(event.body);
        console.log(params);
        // const { params } = event.arguments;
        const { profileId, servantId, channelId, action, message, loadingState } = params;
        // Get Secrect Key
        const { Parameters } = await (new aws.SSM())
        .getParameters({
            Names: ["STREAM_IO_SECRET_KEY"].map(secretName => process.env[secretName]),
            WithDecryption: true,
        })
        .promise();
        let secrets = {};
        Parameters.map((secret)=>secrets[secret['Name']] = secret['Value']);
        // Set up Stream Chat Client
        const serverClient = StreamChat.getInstance(process.env.STREAM_IO_API_KEY, secrets[process.env.STREAM_IO_SECRET_KEY]);
        // console.log(process.env.STREAM_IO_API_KEY, secrets[process.env.STREAM_IO_SECRET_KEY]);
        let response;
        if(action === "generateToken"){
            response = serverClient.createToken(`user-${profileId}`);
            let carpenter = {
                id: `carpenter-${profileId.split('-')[0]}`,
                name: 'Carpenter',
                servantId: profileId.split('-')[0],
                role: 'admin'
            };
            await serverClient.upsertUser(carpenter);
            // console.log(response);
            // Get Profile by profileId
            // let profile = await apiCallRequest({ id: profileId }, getProfile, "getProfile", process.env.API_INFINITYENGINE_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_INFINITYENGINE_GRAPHQLAPIKEYOUTPUT);
            // console.log(profile);
            // if(profile.data && typeof profile.data === "string") profile.data = JSON.parse(profile.data);
            // profile.data.streamIoToken = response;
            // Update Profile with Stream Token
            // const updateProfileRes = 
            // await apiCallRequest({ input: { id: profileId, data: JSON.stringify(profile.data) } }, updateProfile, "updateProfile", process.env.API_INFINITYENGINE_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_INFINITYENGINE_GRAPHQLAPIKEYOUTPUT);
            // console.log(updateProfileRes);
        } else if(action === "upsertUser") {
            // Get Servant by servantId
            // let servant = await apiCallRequest({ id: servantId }, getServant, "getServant", process.env.API_INFINITYENGINE_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_INFINITYENGINE_GRAPHQLAPIKEYOUTPUT);
            // console.log(servant.title, servantId);
            // let user = {
            //     id: `servant-${servantId}`,
            //     name: servant.title,
            //     servantId: servantId,
            //     role: 'admin'
            // };
            // if(servant.config){
            //     if(typeof servant.config === "string") servant.config = JSON.parse(servant.config);
            //     if(servant.config.templateId){
            //         let template = await apiCallRequest({ id: servant.config.templateId }, getTemplate, "getTemplate", process.env.API_INFINITYENGINE_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_INFINITYENGINE_GRAPHQLAPIKEYOUTPUT);
            //         console.log(template);
            //         if(template.metadata && typeof template.metadata === "string") template.metadata = JSON.parse(template.metadata);
            //         if(template.metadata.thumbnail && template.metadata.thumbnail.file) user.image = `https://s3.ap-northeast-1.wasabisys.com/ie-${process.env.ENV.includes("prod") ? "prod" : "dev"}/${template.metadata.thumbnail.file}`
            //     }
            //     if(servant.config.avatar) user.image = servant.config.avatar;
            // }
            // response = await serverClient.upsertUser(user);
        }
        // else if(action === "queryChannel") {
        //     const channels = await serverClient.queryChannels({ id: channelId });
        //     console.log(channels);
        //     response = channels[0].data.name;
        // }
        else if(action === "sendMessage") {
            const channel = serverClient.channel('messaging', channelId);
            // console.log(message);
            await channel.create();
            response = await channel.sendMessage(message);
        } 
        else if(action === "updateMessage") {
            response = serverClient.updateMessage(message);
        } 
        else if(action === "typingIndicator") {
            const channel = serverClient.channel('messaging', channelId);
            await channel.create();
            await channel.sendEvent({
                type: (loadingState === true) ? 'typing.start' : 'typing.stop',
                user_id: servantId
            });
            response = "Success";
        }
        return (event.arguments) ? JSON.stringify({
            statusCode: 200,
            body: response
        }) : {
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.log(`ERROR: ${JSON.stringify(error)}`);
        return JSON.stringify({
            statusCode: 500,
            body: error
        });
    }
};
