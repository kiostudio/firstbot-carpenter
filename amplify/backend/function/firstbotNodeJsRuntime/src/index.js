process.env.NPM_CONFIG_CACHE = '/tmp/.npm';

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    try {
        let execRes;
        const { body } = event;
        let { script, dependencies, run_params } = JSON.parse(body);
        if(!script) throw new Error('Script is required');
        if(!script.includes('exeFunc')) throw new Error('Script must include exeFunc');
        if(!dependencies) throw new Error('Dependencies is required');
        if(!run_params) throw new Error('RunParams is required');
        if(typeof dependencies === 'string') dependencies = JSON.parse(dependencies);
        if(typeof run_params === 'string') run_params = JSON.parse(run_params);
        console.log(`script: ${script}`);
        console.log(`dependencies:`,dependencies);
        console.log('run_params:',run_params);
        if(dependencies){
            const { execSync } = require("child_process");
            const dir = '/tmp';
            await Promise.all(Object.keys(dependencies).map(async (dependency)=>{
                // console.log('dependency: ',dependency);
                await execSync(`npm install ${dependency}@${dependencies[dependency]}`,{ stdio: "inherit", cwd: dir });
                // Insert '/tmp/node_modules/' to the beginning of the require path in the executor.function
                script = script.replace(new RegExp(`require\\(['"]${dependency}['"]\\)`,'g'),`require('/tmp/node_modules/${dependency}')`);
            }));
        }
        console.log(`script: ${script}`);
        eval(script);
        if(script.includes('async')){
            execRes = await exeFunc(run_params);
        } else {
            execRes = exeFunc(run_params);
        }
        console.log(`execRes: ${JSON.stringify(execRes)}`);
        return {
            statusCode: 200,
            body: typeof execRes === 'string' ? { execRes : execRes } : JSON.stringify({ execRes })
        };
    } catch (error) {
        console.log(`ERROR:`,error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error : error.message })
        };
    }
};