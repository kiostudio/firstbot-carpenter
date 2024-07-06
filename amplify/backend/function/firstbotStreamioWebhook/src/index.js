/* Amplify Params - DO NOT EDIT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIIDOUTPUT
	API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const fetch = require('node-fetch');

const createLogging = /* GraphQL */ `
  mutation CreateLogging(
    $input: CreateLoggingInput!
    $condition: ModelLoggingConditionInput
  ) {
    createLogging(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
      profileId
      type
      data
      __typename
    }
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
    let body = JSON.parse(event.body);
    try {
        if(body.type !== "message.new") return {
            statusCode: 200,
            body: JSON.stringify('Webhook Processed')
        };
        let { channel_id } = body;
        console.log(`channel_name:`,body.channel.name);
        console.log(`channel_profileId:`,body.channel.profileId);
        console.log(`channel_servantId:`,body.channel.servantId);
        // remove the carpenter- prefix and user- prefix
        console.log(`user_id`,body.user.id);
        console.log(`channel_id: ${channel_id}`);

        if(body.user.id.includes('carpenter-')) return {
            statusCode: 200,
            body: JSON.stringify('Webhook Processed')
        };

        // Create a logging record
        const createClientSideAPILogging = { input: { profileId: body.channel.profileId, type: 'clientSideAPIRequest', data: JSON.stringify(event) } };
        const createClientSideAPILoggingRes = await apiCallRequest(createClientSideAPILogging,createLogging,'createLogging',process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT,process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT);
        console.log(createClientSideAPILoggingRes);

        return {
            statusCode: 200,
            body: JSON.stringify('Webhook Processed')
        };   
    } catch (error) {
        console.log(`Error Happens in Webhook Process:`,error);
        return {
            statusCode: 200,
            body: JSON.stringify('Webhook Processed')
        };        
    }
};
