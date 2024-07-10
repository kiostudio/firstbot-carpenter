import subprocess
import os
import shutil
import ast
import json
import platform

PIP_PYTHONPATH = '/tmp/pip'
os.environ['PYTHONPATH'] = PIP_PYTHONPATH

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
        # print(res)
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
                other_code.append(ast.unparse(node)) # Requires Python 3.9+
        
        return '\n'.join(new_imports), '\n'.join(other_code)
    except Exception as e:
        raise e

def handler(event, context):
    try:
        base_header_dict = {
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            }
        }

        body = event.get('body')
        print(f"received event body: {body or 'No body provided'}")

        if body is None or body == '' or body == {}:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No body provided'}),
                **base_header_dict
            }

        body = json.loads(body)

        # script is compulsory
        if 'script' not in body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields: script'}),
                **base_header_dict
            }

        script = body.get('script')
        converted_imports, remaining_code = convert_imports(script)

        # dependencies and run_params are optional
        dependencies = body.get('dependencies', None)
        if dependencies and len(dependencies) > 0:
            dependencies = dependencies.replace('\n', ' ')
            install_package(dependencies)
            print('Successfully installed all packages: ')

        run_params = body.get('run_params', {}) # Must use an empty dict or exec() will throw an error
        if run_params and len(run_params) > 0:
            run_params = json.loads(run_params) if isinstance(run_params, str) else run_params

        final_script = f"""
import importlib
import sys

sys.path.append('{PIP_PYTHONPATH}') # Setting env var PYTHONPATH does not work in exec(), so use sys.path to set again

{converted_imports}

{remaining_code}

exe_func_res = exeFunc(**{run_params})
        """

        exec(final_script, globals()) # globals() is used to inject the imported modules AND to carry the function result

        result = {'exeRes': ''}
        result['exeRes'] = globals()['exe_func_res']
        print(f"exeRes: {result['exeRes']}")
        rm_dir_content('/tmp') # MUST remove /tmp to avoid package conflicts or file access by other lambda invocations during the same execution lifecycle

        return {
            'statusCode': 200,
            'body': json.dumps(result),
            **base_header_dict
        }

    except Exception as e:
        print(f"Error: {e}")
        print(f"Line no.: {e.__traceback__.tb_lineno}")

        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            **base_header_dict
        }