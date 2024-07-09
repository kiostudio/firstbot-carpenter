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
    try {

        let response = 'success';

        // Execute the function with the arguments
        const arguExecRun = async (functionArgu, endPointUrl) => {
            let response;
            // let logType = 'info';
            try {
                // if (typeof functionArgu === 'string') functionArgu = JSON.parse(functionArgu);
                const scriptRunRes = await fetch(endPointUrl, {
                    method: 'post',
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

        // IF there is an argument, parse it || Or find the parameters in the body
        let params;
        console.log(event.arguments, typeof event.arguments);
        console.log(event.body, typeof event.body);
        if (event.arguments) params = JSON.parse(event.arguments.params);
        else params = JSON.parse(event.body);
        console.log(params);
        const { script, dependencies, run_params, runtime, profileId } = params;

        const runtTimeEndpoint = {
            'nodejs_runtime': process.env.FIRSTBOT_NODEJS_RUNTIME,
            'python_runtime': process.env.FIRSTBOT_PYTHON_RUNTIME,
        };

        const runTimeParams = {
            script: script,
            dependencies: dependencies,
            run_params: run_params
        };

        const arguExecRes = await arguExecRun(runTimeParams, runtTimeEndpoint[runtime]);

        const createRuntimeLogging = {
            input: {
                profileId: profileId,
                type: 'exeRuntime',
                data: JSON.stringify({ 
                    result : arguExecRes , 
                    runtime : runtime,
                    code: runTimeParams,
                    status: (arguExecRes.error) ? 'error' : 'success'
                })
            }
        };

        const createRuntimeLoggingRes = await apiCallRequest(createRuntimeLogging, createLogging, 'createLogging', process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_FIRSTBOTCARPENTER_GRAPHQLAPIKEYOUTPUT);
        console.log(createRuntimeLoggingRes);
       
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
