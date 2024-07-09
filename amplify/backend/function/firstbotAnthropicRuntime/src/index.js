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

const getLoggingByProfileId = /* GraphQL */ `
  query GetLoggingByProfileId(
    $profileId: ID!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelLoggingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    getLoggingByProfileId(
      profileId: $profileId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        createdAt
        updatedAt
        profileId
        type
        data
        __typename
      }
      nextToken
      __typename
    }
  }
`;

const firstbotStreamioAction = /* GraphQL */ `
  query FirstbotStreamioAction($params: String) {
    firstbotStreamioAction(params: $params)
  }
`;

const apiCallRequest = async function (variables, graphQuery, graphQueryName, graphqlEndpoint, graphqlApiKey) {
    try {
        const options = {
            method: 'POST',
            headers: {
                'x-api-key': graphqlApiKey
            },
            body: JSON.stringify({ query: graphQuery, variables: variables })
        };
        const request = new fetch.Request(graphqlEndpoint, options);
        // console.log('request: ',request);
        response = await fetch(request);
        body = await response.json();
        // console.log('body: ',body.data);
        if (body.errors) {
            console.log(`Error Happens in ${graphQueryName}:`, body.errors);
            return body.errors;
        }
        return body.data[graphQueryName];
    } catch (error) {
        console.log(`Error Happens in ${graphQueryName}:`, error);
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
        if (event.arguments) {
            let { params } = event.arguments;
            variables = JSON.parse(params);
            isArguments = true;
        } else {
            const { body } = event;
            variables = JSON.parse(body);
        }
        let { messageData, anthropicApiKey, profileId } = variables;
        if (typeof messageData === 'string') messageData = JSON.parse(messageData);
        // console.log(`messageData:`,messageData, typeof messageData);
        if (typeof messageData.body === 'string') messageData.body = JSON.parse(messageData.body);
        const textMessage = messageData.body.message.text;
        console.log(`textMessage:`, textMessage);

        // Execute the function with the arguments
        const arguExecRun = async (functionArgu, endPointUrl) => {
            let response;
            // let logType = 'info';
            try {
                // if (typeof functionArgu === 'string') functionArgu = JSON.parse(functionArgu);
                const scriptRunRes = await fetch(endPointUrl, {
                    method: 'post',
                    // body: JSON.stringify({
                    // script: `const fetch = require('node-fetch');
                    //     async function exeFunc(params){
                    //     const response = await fetch('https://ttrcbhtn5sspvps6bpysfezove0vtmim.lambda-url.us-east-1.on.aws/',{
                    //         method: 'post',
                    //         body: JSON.stringify(params),
                    //         headers: {'Content-Type': 'application/json'}
                    //     });
                    //     const body = await response.json();
                    //     return body;
                    // }`,
                    // dependencies: `{"node-fetch": "2"}`,
                    // testArgu: JSON.stringify({ ...functionArgu })
                    // }),
                    body: typeof functionArgu === 'string' ? functionArgu : JSON.stringify(functionArgu),
                    headers: { 'Content-Type': 'application/json' }
                });
                response = await scriptRunRes.json();
                console.log(`Script Run Response: ${JSON.stringify(response)}`);
                return response;
            } catch (error) {
                console.log(`Function Executor Error`, error);
                response = { execRes: { error: error } };
                logType = 'error';
                return { execRes: { error: error } };
            } finally {
                //   await createTaskLogging(typesenseClient,servant,servant.id,{ message : `tool execution result : ${JSON.stringify(response)}` },logType,executor.jobId);
            }
        };

        // Send message to Streamio
        const sendMessageToStreamio = async (aiResponse, channelId, profileId, action, messageId) => {
            try {
                let messageParam = {
                    action: action,
                    channelId: channelId,
                    message: {
                        text: aiResponse,
                        user_id: `carpenter-${profileId.split('-')[0]}`
                    }
                };
                if (messageId) messageParam.message.id = messageId;
                console.log(`messageParam: ${JSON.stringify(messageParam)}`);
                console.log(`firstbotStreamioAction`, firstbotStreamioAction);
                const sendMessageToStreamioRes = await apiCallRequest({ params: JSON.stringify(messageParam) }, firstbotStreamioAction, 'firstbotStreamioAction', process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT);
                console.log(`sendMessageToStreamioRes: ${JSON.stringify(sendMessageToStreamioRes)}`, typeof sendMessageToStreamioRes);
                return (sendMessageToStreamioRes) ? JSON.parse(sendMessageToStreamioRes) : null;
            } catch (error) {
                console.log('Error Happens in sendMessageToStreamio:', error);
                // throw error;
            }
        };

        // Streamio Pending Message 
        const streamIoPendingMessage = async (channelId, profileId, loadingState) => {
            try {
                // console.log(`Send loading message : channelId: ${channelId}, servantId: ${servantId}`,loadingState);
                const loadingMessageRes = await apiCallRequest({
                    params: JSON.stringify({
                        action: 'typingIndicator',
                        channelId: channelId,
                        servantId: `carpenter-${profileId.split('-')[0]}`,
                        loadingState: loadingState
                    })
                }, firstbotStreamioAction, "firstbotStreamioAction", process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT);
                // console.log(`loadingMessageRes: ${JSON.stringify(loadingMessageRes)}`);
            } catch (error) {
                console.log(`Error Happens in streamIoPendingMessage:`, error);
                throw new Error(error);
            }
        }

        // Save conversation as a log
        const saveConversationLog = async (userMessage, aiResponse, profileId) => {
            try {
                const createLoggingRes = await apiCallRequest({
                    input: {
                        profileId: profileId,
                        type: 'conversation',
                        data: JSON.stringify({ user: userMessage, ai: aiResponse })
                    }
                }, createLogging, 'createLogging', process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT);
                console.log(`createLoggingRes: ${JSON.stringify(createLoggingRes)}`);
            } catch (error) {
                console.log(`Error Happens in saveConversationLog:`, error);
                throw new Error(error);
            }
        }

        // Retrive the conversation log by profileId
        const getConversationLog = async (profileId, limit = 10, nextToken = null, logs = []) => {
            try {
                let variables = {
                    profileId: profileId,
                    filter: { type: { eq: 'conversation' } },
                    sortDirection: 'DESC',
                    limit: 100
                };
                if (nextToken) variables.nextToken = nextToken;
                const getLoggingByProfileIdRes = await apiCallRequest(variables, getLoggingByProfileId, 'getLoggingByProfileId', process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT);
                console.log(`getLoggingByProfileIdRes: ${JSON.stringify(getLoggingByProfileIdRes)}`);
                logs = logs.concat(getLoggingByProfileIdRes.items);
                if (getLoggingByProfileIdRes.nextToken || logs.length < limit) return await getConversationLog(profileId, limit, getLoggingByProfileIdRes.nextToken, logs);
                if (logs.length > limit) logs = logs.slice(0, limit);
                // Sort date from oldest to newest
                return logs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            } catch (error) {
                console.log(`Error Happens in getConversationLog:`, error);
                throw new Error(error);
            }
        }

        // Anthropic Runtime Function
        const anthropicRuntimeFunc = async (messages, anthropicApiKey, profileId) => {
            console.log('Anthropic Runtime Function', JSON.stringify(messages, null, 2), profileId);
            let params = {
                'model': `claude-3-5-sonnet-20240620`,
                'max_tokens': 4096,
                'messages': messages,
                'system': ` I am Carpenter, a skilled NodeJS / Python developer specialized in writing, testing, and deploying NodeJS / Python scripts on AWS Lambda.
                    Hello! I'm Carpenter, your expert in writing, testing, and deploying NodeJS / Python scripts tailored for AWS Lambda. My integration with AWS services ensures your applications are robust and scalable.
                    **Instructions for Users:**
                    - When you provide tasks or specific scripting requirements, please ensure details are clear. If any instructions are ambiguous, I’ll seek clarification to ensure your needs are exactly met.
                    - If your task involves continuous script running and testing, feel free to provide detailed expectations or ask for my assistance in setting up proper testing protocols.
                    - For any function or plugin utilization, explicit instructions on input values are essential. Avoid assumptions and communicate clearly to ensure the functionality meets the task requirements precisely.

                    ** Scripting : exeFunc**
                    - Make sure the main calling an async function is called exeFunc in the script. This function should be defined in the code snippet you provide.
                    - For example in nodejs: async function exeFunc(params){ 
                        const { input1, input2 } = params;
                        // Your code here
                        return 'Your output';
                    }
                    - For example in python3: def exeFunc(**params):
                        // Your code here
                        return 'Your output';
                    - The input parameters for the exeFunc function should be passed as a JSON object, so please destruct the object in the function in order to use it.

                    ** Dependencies: dependencies**
                    - Please include all the dependencies required to run the function and the latest version correspondingly. It should look like the dependencies property in a package.json file. Don't include any default NodeJS / Python module.

                    **Testing Protocols: run_params**
                    - During script testing, there is no need for manual trigger of the execution function ('exeFunc'). The test environment is designed to automatically trigger this function when test parameters are provided, simplifying the process and ensuring consistency in script execution.
                    - the run_params parameter should be a JSON object that acts as the arguments to test the exeFunc function. It will be passed to the exeFunc and executed. Please destruct the object in the function in order to use it.
                    - The script should include the main function named as exeFunc that can run in a NodeJS / Python3 environment with eval() / exec() function. The exeFunc function must be defined in the code.

                    ** Input Schema for Runtime Tools: input_schema**
                    - Please also return the input_schema in the script, which is a JSON schema that defines the input parameters required for the runtime tools. It will be saved in the database for future reference.
                    - A JSON schema that defines the input parameters required for the runtime tools.
                    - Input Schema:
                        {
                        "type": "object",
                        "properties": {
                        "location": {
                        "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                                "description": "The unit of temperature, either "celsius" or "fahrenheit""
                            }
                        },
                            "required": ["location"]
                        }
                `,
                'tools': [
                    {
                        'name': 'nodejs_runtime',
                        'description': 'This is the script of the running and testing environment : exports.handler = async (event) => { try { eval(script); if(script.includes("async")){ execRes = await exeFunc(run_params); } else { execRes = exeFunc(run_params); } return { statusCode: 200, body: JSON.stringify({ execRes : execRes }) }; } catch (error) { console.log(`ERROR:`,error); return { statusCode: 500, body: JSON.stringify({ error : error.message }) }; } };',
                        'input_schema': {
                            'type': 'object',
                            'properties': {
                                "script": {
                                    "type": "string",
                                    "description": "A piece of code snippet including the main function named as exeFunc that can run in a NodeJS environemnt with eval() function. The exeFunc function must be defined in the code.",
                                },
                                "dependencies": {
                                    "type": "string",
                                    "description": "A stringify JSON object include all the dependencies required to run the function and the latest version correspondingly. It should look like the dependencies property in a package.json file. Don't include any default NodeJS / Python module.",
                                },
                                "run_params": {
                                    "type": "string",
                                    "description": "A stringify JSON object that act as the arguments to test the exeFunc function. It will pass to the exeFunc and execute.",
                                },
                                "input_schema": {
                                    "type": "string",
                                    "description": "A JSON schema that defines the input parameters required for the runtime tools."
                                }
                            },
                            "required": ["script", "dependencies", "input_schema", "run_params"]
                        }
                    },
                    {
                        'name': 'python_runtime',
                        'description': 'This is the script of the running and testing environment : def handler(event, context): try: script = event["script"] dependencies = event["dependencies"] or None run_params = event["runParams"] or None converted_imports, remaining_code = convert_imports(script) final_script = f""" import importlib import sys sys.path.append("/tmp/pip") # Setting env var PYTHONPATH does not work in exec(), so use sys.path to set again {converted_imports} {remaining_code} exe_func_res = exeFunc(**{run_params}) """ exec(final_script, globals()) result = {"execRes": ""} result["execRes"] = globals()["exe_func_res"] return { "statusCode": 200, "body": json.dumps(result) } except Exception as e: return { "statusCode": 500, "body": json.dumps({"error": str(e)}) }',
                        'input_schema': {
                            'type': 'object',
                            'properties': {
                                "script": {
                                    "type": "string",
                                    "description": "A piece of code snippet including the main function named as exeFunc that can run in a Python3 environemnt with exec() function. The exeFunc function must be defined in the code.",
                                },
                                "dependencies": {
                                    "type": "string",
                                    "description": "A list of python packages include all the dependencies required to run the function and the latest version correspondingly. It should look like the content in a requirement.txt file. Don't include any default NodeJS / Python module.",
                                },
                                "run_params": {
                                    "type": "string",
                                    "description": "A stringify JSON object that act as the arguments to test the exeFunc function. It will pass to the exeFunc and execute.",
                                },
                                "input_schema": {
                                    "type": "string",
                                    "description": "A JSON schema that defines the input parameters required for the runtime tools."
                                }
                            },
                            "required": ["script", "dependencies", "input_schema", "run_params"]
                        }
                    }
                ]
            };
            const runtTimeEndpoint = {
                'nodejs_runtime': process.env.FIRSTBOT_NODEJS_RUNTIME,
                'python_runtime': process.env.FIRSTBOT_PYTHON_RUNTIME,
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
            console.log('Anthropic Response : ', JSON.stringify(jsonAnthropicResponse, null, 2));
            let toolInput = jsonAnthropicResponse.content.filter(item => item.type === 'tool_use');
            if (toolInput.length > 0) {
                messages.push({
                    role: 'assistant',
                    content: jsonAnthropicResponse.content
                });
                toolInput = toolInput[0];
                await streamIoPendingMessage(messageData.body.channel_id, profileId, true);
                const arguExecRes = await arguExecRun(toolInput.input, runtTimeEndpoint[toolInput.name]);
                console.log('Argument Execution Result : ', arguExecRes);
                const createRuntimeLogging = {
                    input: {
                        profileId: profileId,
                        type: 'exeRuntime',
                        data: JSON.stringify({
                            result: arguExecRes,
                            runtime: toolInput.name,
                            code: toolInput.input,
                            status: (arguExecRes.error) ? 'error' : 'success'
                        })
                    }
                };
                const createRuntimeLoggingRes = await apiCallRequest(createRuntimeLogging, createLogging, 'createLogging', process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT);
                console.log(createRuntimeLoggingRes);
                execRes = arguExecRes;
                messages.push({
                    role: 'user',
                    content: [{
                        type: 'tool_result',
                        tool_use_id: toolInput.id,
                        content: (typeof execRes === 'string') ? execRes : JSON.stringify(execRes)
                    }]
                });
                return await anthropicRuntimeFunc(messages, anthropicApiKey, profileId);
            };
            return jsonAnthropicResponse.content[0].text;;
        }

        await streamIoPendingMessage(messageData.body.channel_id, profileId, true);
        let messages = [];
        // Get recent conversation log
        const conversationLogs = await getConversationLog(profileId, 25);
        console.log(`conversationLogs: ${JSON.stringify(conversationLogs)}`);
        // If there is a conversation log, add it to the messages
        if (conversationLogs.length > 0) {
            conversationLogs.forEach(log => {
                if (!log.data) return;
                if (log.type !== 'conversation') return;
                if (typeof log.data === 'string') log.data = JSON.parse(log.data);
                if (log.data.user) messages.push({ role: 'user', content: log.data.user });
                if (log.data.ai) messages.push({ role: 'assistant', content: log.data.ai });
            });
        }
        if (textMessage) messages = messages.concat([{ role: 'user', content: textMessage }]);
        const aiResponse = await anthropicRuntimeFunc(messages, anthropicApiKey, profileId);
        console.log('AI Response : ', aiResponse);
        await streamIoPendingMessage(messageData.body.channel_id, profileId, false);
        await sendMessageToStreamio(aiResponse, messageData.body.channel_id, profileId, 'sendMessage', null);
        await saveConversationLog(textMessage, aiResponse, profileId);
        return {
            statusCode: 200,
            body: JSON.stringify('Anthropic Processed')
        };
    } catch (error) {
        console.log(`Error Happens in Webhook Process:`, error);
        return {
            statusCode: 500,
            body: JSON.stringify(`Error Happens in Process: ${error}`)
        };
    }
};
