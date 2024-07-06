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
        // console.log(`messageData:`,messageData, typeof messageData);
        if(typeof messageData.body === 'string') messageData.body = JSON.parse(messageData.body);
        const textMessage = messageData.body.message.text;
        console.log(`textMessage:`,textMessage);

        // Execute the function with the arguments
        const arguExecRun = async (functionArgu,endPointUrl) => {
            let response;
            // let logType = 'info';
            try {
                if(typeof functionArgu === 'string') functionArgu = JSON.parse(functionArgu);
                const scriptRunRes = await fetch(endPointUrl,{
                    method: 'post',
                    body: JSON.stringify({
                        script: `const fetch = require('node-fetch');
                            async function exeFunc(params){
                            const response = await fetch('https://ttrcbhtn5sspvps6bpysfezove0vtmim.lambda-url.us-east-1.on.aws/',{
                                method: 'post',
                                body: JSON.stringify(params),
                                headers: {'Content-Type': 'application/json'}
                            });
                            const body = await response.json();
                            return body;
                        }`,
                        dependencies: `{"node-fetch": "2"}`,
                        testArgu: JSON.stringify({ ...functionArgu })
                    }),
                    headers: {'Content-Type': 'application/json'}
                });
                response = await scriptRunRes.json();
                console.log(`Script Run Response: ${JSON.stringify(response)}`);
                return response;
            } catch (error) {
              console.log(`Function Executor Error`,error);
              response = { execRes: { error: error } };
              logType = 'error';
              return { execRes: { error: error } };
            } finally {
            //   await createTaskLogging(typesenseClient,servant,servant.id,{ message : `tool execution result : ${JSON.stringify(response)}` },logType,executor.jobId);
            }
        };
        
        // Send message to Streamio
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
        };

        // Anthropic Runtime Function
        const anthropicRuntimeFunc = async (messages,anthropicApiKey,profileId) => {
            console.log('Anthropic Runtime Function',messages,profileId);
            let params = {
                'model': `claude-3-sonnet-20240229`,
                'max_tokens': 4096,
                'messages': messages,
                'system': ` I am Carpenter, a skilled NodeJS developer specialized in writing, testing, and deploying NodeJS or Python scripts on AWS Lambda.
                    Hello! I'm Carpenter, your expert in writing, testing, and deploying NodeJS scripts tailored for AWS Lambda. My integration with AWS services ensures your applications are robust and scalable.
                    **Instructions for Users:**
                    - When you provide tasks or specific scripting requirements, please ensure details are clear. If any instructions are ambiguous, I’ll seek clarification to ensure your needs are exactly met.
                    - If your task involves continuous script running and testing, feel free to provide detailed expectations or ask for my assistance in setting up proper testing protocols.
                    - Make sure the main calling an async function is called exeFunc in the script. This function should be defined in the code snippet you provide.
                    - For example : async function exeFunc(params){ return params; }

                    **Testing Protocols:**
                    - During script testing, there is no need for manual trigger of the execution function ('exeFunc'). The test environment is designed to automatically trigger this function when test parameters are provided, simplifying the process and ensuring consistency in script execution.
                    
                    **Interaction Guidelines:**
                    - For any function or plugin utilization, explicit instructions on input values are essential. Avoid assumptions and communicate clearly to ensure the functionality meets the task requirements precisely.
                `,
                'tools': [
                    {
                        'name': 'nodejs_runtime',
                        'description': 'This is the script of the running and testing environment : exports.handler = async (event) => { try { eval(script); if(script.includes("async")){ execRes = await exeFunc(testArgu); } else { execRes = exeFunc(testArgu); } return { statusCode: 200, body: JSON.stringify({ execRes : execRes }) }; } catch (error) { console.log(`ERROR:`,error); return { statusCode: 500, body: JSON.stringify({ error : error.message }) }; } };',
                        'input_schema': {
                            'type': 'object',
                            'properties': {
                                "script": {
                                    "type": "string",
                                    "description": "A piece of code snippet including the main function named as exeFunc that can run in a NodeJS environemnt with eval() function. The exeFunc function must be defined in the code.",
                                },
                                "dependencies":{
                                    "type": "string",
                                    "description": "A stringify JSON object include all the dependencies required to run the function and the latest version correspondingly. It should look like the dependencies property in a package.json file. Don't include any default NodeJS module.",
                                },
                                "testArgu":{
                                    "type": "string",
                                    "description": "A stringify JSON object that act as the arguments to test the exeFunc function. It will pass to the exeFunc and execute.",
                                }
                            }
                        }
                    }
                ]
            };
            const runtTimeEndpoint = {
                'nodejs_runtime': process.env.FIRSTBOT_NODEJS_RUNTIME
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
            let toolInput = jsonAnthropicResponse.content.filter(item => item.type === 'tool_use');
            if(toolInput.length > 0){
                messages.push({
                    role: 'assistant',
                    content: jsonAnthropicResponse.content
                });
                toolInput = toolInput[0];
                const arguExecRes = await arguExecRun(toolInput.input,runtTimeEndpoint[toolInput.name]);
                console.log('Argument Execution Result : ',arguExecRes);
                execRes = arguExecRes;
                messages.push({
                    role: 'user',
                    content: [{
                        type: 'tool_result',
                        tool_use_id: toolInput.id,
                        content: (typeof execRes === 'string') ? execRes : JSON.stringify(execRes)
                    }]
                });
                return await anthropicRuntimeFunc(messages,anthropicApiKey,profileId);
            };
            return jsonAnthropicResponse.content[0].text;;
        }

        let messages = [];
        if(textMessage) messages.push({ role: 'user', content: textMessage });
        const aiResponse = await anthropicRuntimeFunc(messages,anthropicApiKey,profileId);
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
