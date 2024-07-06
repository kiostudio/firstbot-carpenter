import subprocess
import os
import shutil
import ast
import json
import platform

os.environ['PYTHONPATH'] = '/tmp/pip'

def get_current_pip_list():
    try:
        cmd = "pip3 list"
        res = subprocess.check_call(cmd, shell=True, stderr=subprocess.STDOUT)
        return res
    except Exception as e:
        raise e

def install_package(packages):
    try:
        # MUST be used alongside PYTHONPATH = '/tmp/pip' in the lambda environment
        cmd = f"pip3 install --target '/tmp/pip' {packages}"
        res = subprocess.check_call(cmd, shell=True, stderr=subprocess.STDOUT)
        print(res)
        return True
    except Exception as e:
        raise e

def rm_dir_content(path):
    try:
        folder_path = path
        if os.path.exists(folder_path):
            for filename in os.listdir(folder_path):
                file_path = os.path.join(folder_path, filename)
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.remove(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
    except Exception as e:
        raise e

def convert_imports(script):
    try:
        tree = ast.parse(script)
        new_imports = []
        other_code = []
        
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        import_stmt = f"{alias.asname or alias.name} = importlib.import_module('{alias.name}')"
                        new_imports.append(import_stmt)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module
                    for alias in node.names:
                        if alias.name == '*':
                            import_stmt = f"globals().update(importlib.import_module('{module}').__dict__)"
                        else:
                            import_stmt = f"{alias.asname or alias.name} = importlib.import_module('{module}').{alias.name}"
                        new_imports.append(import_stmt)
            else:
                other_code.append(ast.unparse(node))
        
        return '\n'.join(new_imports), '\n'.join(other_code)
    except Exception as e:
        raise e

def handler(event, context):
    try:
        print('received event:')
        print(event)
        print('received context:')
        print(context)
        print("os.environ['PYTHONPATH']:")
        print(os.environ['PYTHONPATH'])
        print("python version:")
        print(platform.python_version())

        if event['body'] is None or event['body'] == '' or event['body'] == {}:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps({'error': 'No body provided'})
            }

        body = json.loads(event['body'])

        if 'dependencies' not in body or 'script' not in body or 'run_params' not in body:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps({'error': 'Missing required fields: dependencies, script, run_params'})
            }

        print(type(body))
        print(body)

        dependencies = body['dependencies']
        script = body['script']
        run_params = json.loads(body['run_params']) if type(body['run_params']) == str else body['run_params']

        result = {'execRes': ''}
        if dependencies and install_package(dependencies.replace('\n', ' ')):
            print('Successfully installed all packages')
        
        exec_params = {}
        if dependencies and run_params:
            print(run_params)
            exec_params = run_params

        converted_imports, remaining_code = convert_imports(script)

        print(converted_imports)
        print(remaining_code)

        final_script = f"""
print(os.environ['PYTHONPATH'])
import importlib

{converted_imports}

{remaining_code}

exe_func_res = exeFunc(**{exec_params})
        """

        # print(final_script)
        exec(final_script, globals()) # globals() is used to inject the imported modules AND to carry the function result
        # print(f"escaped_res: {globals()['exe_func_res']}")
        result['execRes'] = globals()['exe_func_res']
        # print(result)
        rm_dir_content('/tmp') # MUST remove /tmp to avoid package conflicts or file access by other lambda invocations during the same execution lifecycle
        # print(os.listdir('/tmp'))

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(result)
        }

    except Exception as e:
        print(f"Error: {e}")
        print(f"line: {e.__traceback__.tb_lineno}")

        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': str(e)})
        }