'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import localeString from "@/lib/locale.json"
import { useToast } from "@/components/ui/use-toast"
import Loader from "@/components/loader"
import { Code } from 'lucide-react';
import CodeEditor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import CopyBtn from "@/components/copyBtn";
import { FaPython, FaNodeJs } from "react-icons/fa";
import { firstbotTriggerRuntime } from "@/src/graphql/queries";

export function CodeSnippetDialog({locale , runTimeResult, profileId, apiClient }) {
    const { toast } = useToast();
    const [load, setLoad] = useState(false);
    const [open, setOpen] = useState(false);
    // console.log('Run Time Result : ', runTimeResult);
    const { code } = runTimeResult;
    const [codeSnippet, setCodeSnippet] = useState(code ? code : null);
    useEffect(() => {
        if(runTimeResult.code) setCodeSnippet(runTimeResult.code);
    }, [runTimeResult]);
    const triggerRuntime = async (params) => {
        try {
            setLoad(true);
            console.log('Trigger Runtime : ', JSON.stringify(params, null, 2));
            const runtime = await apiClient.graphql({ query: firstbotTriggerRuntime, variables: { params: JSON.stringify(params) } });
            console.log('Runtime : ', runtime);
        } catch (error) {
            console.log('Error : ', error);
            toast({
                title: localeString['error'][locale],
                message: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoad(false);
            setOpen(false)
        }
    }
    const CodeEditorField = (label,value,required)=>{
        return <div className="my-2 w-full max-w-md">
            <label className="flex flex-row items-center text-slate-600 dark:text-gray-50  text-md font-bold mb-2">
                {localeString[label][locale]}
                {(required === true) ? <span className="text-red-400 mx-1">{'*'}</span> : null}
                <CopyBtn value={typeof value === 'object' ? JSON.stringify(value) : value} locale={locale} toast={toast} />
            </label>
            <div className="h-fit overflow-y-auto">
                <CodeEditor
                    className={`rounded-sm dark:border-gray-50 border-gray-200 border-[0.1em] min-h-full p-5 bg-white dark:bg-black text-black dark:text-white focus:outline-white focus:ring-2 focus:ring-white`}
                    value={value}
                    onValueChange={code => {
                        setCodeSnippet((prev) => {
                            return { ...prev, [label]: code }
                        })
                    }}
                    highlight={code => highlight(value, languages.js,'javascript')}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14
                    }}
                />
            </div>
        </div>
    }
    const LogosPython = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 255" {...props}>
            <defs>
                <linearGradient id="logosPython0" x1="12.959%" x2="79.639%" y1="12.039%" y2="78.201%">
                    <stop offset="0%" stopColor="#387EB8"></stop>
                    <stop offset="100%" stopColor="#366994"></stop>
                </linearGradient>
                <linearGradient id="logosPython1" x1="19.128%" x2="90.742%" y1="20.579%" y2="88.429%">
                    <stop offset="0%" stopColor="#FFE052"></stop>
                    <stop offset="100%" stopColor="#FFC331"></stop>
                </linearGradient>
            </defs>
            <path fill="url(#logosPython0)" d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072ZM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13a11.12 11.12 0 0 1-11.13 11.13a11.12 11.12 0 0 1-11.13-11.13a11.12 11.12 0 0 1 11.13-11.13Z"></path>
            <path fill="url(#logosPython1)" d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897Zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13a11.12 11.12 0 0 1 11.13-11.131a11.12 11.12 0 0 1 11.13 11.13a11.12 11.12 0 0 1-11.13 11.13Z"></path>
        </svg>
    )
    const runtTimeLogo = (runtime) => {
        if(runtime === "nodejs_runtime") return <FaNodeJs className='w-5 h-5 text-green-500'/>
        if(runtime === "python_runtime") return <LogosPython className='w-5 h-5'/>
        return null;
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-1 font-mono text-xs bg-black hover:bg-slate-900" onClick={() => setOpen(true)} variant="outline" size="sm">
                    {/* <Code size={16} /> */}
                    {runtTimeLogo(runTimeResult.runtime)}
                    <span>{localeString['code'][locale]}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="gap-5">
                <DialogHeader>
                <DialogTitle>
                    <div className="flex flex-row items-center justify-start gap-2">
                        {localeString['code'][locale]}
                        {runtTimeLogo(runTimeResult.runtime)}
                    </div>
                </DialogTitle>
                <DialogDescription>
                    {localeString['codeSnippetWrittenByAi'][locale]}
                </DialogDescription>
                </DialogHeader>
                <div className="flex items-start space-x-2 h-[60vh] overflow-auto">
                    <div className="grid flex-1 gap-2">
                        {codeSnippet && codeSnippet.script ? CodeEditorField('script',codeSnippet.script,false) : null}
                        {codeSnippet && codeSnippet.dependencies ? CodeEditorField('dependencies',codeSnippet.dependencies,false) : null}
                        {codeSnippet && codeSnippet.input_schema ? CodeEditorField('input_schema',codeSnippet.input_schema,false) : null}
                        {codeSnippet && codeSnippet.run_params ? CodeEditorField('run_params',codeSnippet.run_params,false) : null}
                    </div>
                    {/* <Button type="submit" size="sm" className="px-3">
                    </Button> */}
                </div>
                <DialogFooter className="justify-end">
                    <Button 
                        className="bg-black hover:bg-slate-900 text-white"
                        type="submit" 
                        disabled={load}
                        onClick={async()=>{
                            // script, dependencies, run_params, runtime, profileId
                            await triggerRuntime({
                                script: codeSnippet.script,
                                dependencies: codeSnippet.dependencies,
                                run_params: codeSnippet.run_params,
                                runtime: runTimeResult.runtime,
                                profileId: profileId
                            });
                        }}   
                    >
                        {(load === false) ? localeString['run'][locale] : <Loader />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
