process.env.NPM_CONFIG_CACHE = '/tmp/.npm';

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    try {
        let execRes;
        const { body } = event;
        let { script, dependencies, testArgu } = JSON.parse(body);
        if(!script) throw new Error('Script is required');
        if(!script.includes('exeFunc')) throw new Error('Script must include exeFunc');
        if(!dependencies) throw new Error('Dependencies is required');
        if(!testArgu) throw new Error('RunParams is required');
        if(typeof dependencies === 'string') dependencies = JSON.parse(dependencies);
        if(typeof testArgu === 'string') testArgu = JSON.parse(testArgu);
        console.log(`script: ${script}`);
        console.log(`dependencies:`,dependencies);
        console.log('testArgu:',testArgu);
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
            execRes = await exeFunc(testArgu);
        } else {
            execRes = exeFunc(testArgu);
        }
        console.log(`execRes: ${JSON.stringify(execRes)}`);
        return {
            statusCode: 200,
            body: JSON.stringify({ execRes : execRes })
        };
    } catch (error) {
        console.log(`ERROR:`,error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error : error.message })
        };
    }
};