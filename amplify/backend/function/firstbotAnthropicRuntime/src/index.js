/* Amplify Params - DO NOT EDIT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIIDOUTPUT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const fetch = require('node-fetch');


const firstbotStreamioAction = /* GraphQL */ `
  query FirstbotStreamioAction($params: String) {
    firstbotStreamioAction(params: $params)
  }
`;

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

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    let isArguments = false;
    let variables;
    try {
        if(event.arguments){
            let { params } = event.arguments;
            variables = JSON.parse(params);
            isArguments = true;
        } else {
            const { body } = event;
            variables = JSON.parse(body);
        }
        let { messageData, anthropicApiKey , profileId } = variables;
        if(typeof messageData === 'string') messageData = JSON.parse(messageData);
        console.log(`messageData:`,messageData, typeof messageData);
        if(typeof messageData.body === 'string') messageData.body = JSON.parse(messageData.body);
        const textMessage = messageData.body.message.text;
        console.log(`textMessage:`,textMessage);
        let params = {
            'model': `claude-3-sonnet-20240229`,
            'max_tokens': 4096,
            'messages': [
                {
                    'role': 'user',
                    'content': textMessage
                }
            ]
          };
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': anthropicApiKey,
              'content-type': 'application/json',
              'accept': 'application/json',
              'anthropic-version': '2023-06-01',
              'anthropic-beta': 'tools-2024-04-04'
            },
            body: JSON.stringify(params)
        });
        const jsonAnthropicResponse = await anthropicResponse.json();
        console.log('Anthropic Response : ',jsonAnthropicResponse);

        const sendMessageToStreamio = async (aiResponse,channelId,profileId,action,messageId) => {
            try {
              let messageParam = {
                action: action,
                channelId: channelId,
                message: {
                  text: aiResponse,
                  user_id: `carpenter-${profileId.split('-')[0]}`
                }
              };
              if(messageId) messageParam.message.id = messageId;
              console.log(`messageParam: ${JSON.stringify(messageParam)}`);
              console.log(`firstbotStreamioAction`,firstbotStreamioAction);
              const sendMessageToStreamioRes = await apiCallRequest({ params: JSON.stringify(messageParam)},firstbotStreamioAction,'firstbotStreamioAction',process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT,process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT);
              console.log(`sendMessageToStreamioRes: ${JSON.stringify(sendMessageToStreamioRes)}`,typeof sendMessageToStreamioRes);
              return (sendMessageToStreamioRes) ? JSON.parse(sendMessageToStreamioRes) : null;
            } catch (error) {
              console.log('Error Happens in sendMessageToStreamio:',error);
              // throw error;
            }
        }

        const aiResponse = jsonAnthropicResponse.content[0].text;
        console.log('AI Response : ',aiResponse);
        await sendMessageToStreamio(aiResponse,messageData.body.channel_id,profileId,'sendMessage',null);
    
        return {
            statusCode: 200,
            body: JSON.stringify('Anthropic Processed')
        };   
    } catch (error) {
        console.log(`Error Happens in Webhook Process:`,error);
        return {
            statusCode: 500,
            body: JSON.stringify(`Error Happens in Process: ${error}`)
        };        
    }
};
