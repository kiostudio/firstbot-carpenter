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

export function CodeSnippetDialog({locale , runTimeResult }) {
    const { toast } = useToast();
    const [load, setLoad] = useState(false);
    const [open, setOpen] = useState(false);
    console.log('Run Time Result : ', runTimeResult);
    const { code } = runTimeResult;
    const [codeSnippet, setCodeSnippet] = useState(code ? code : null);
    const CodeEditorField = (label,value,required)=>{
        return <div className="my-2 w-full">
            <label className="flex flex-row items-center text-slate-600 dark:text-gray-50  text-md font-bold mb-2">
                {localeString[label][locale]}
                {(required === true) ? <span className="text-red-400 mx-1">{'*'}</span> : null}
                <CopyBtn value={typeof value === 'object' ? JSON.stringify(value) : value} locale={locale} toast={toast} />
            </label>
            <div className="h-fit overflow-y-auto">
                <CodeEditor
                    className={`rounded-sm dark:border-gray-50 border-gray-200 border-[0.1em] min-h-full p-5 bg-white dark:bg-[#020817] text-black dark:text-white focus:outline-white focus:ring-2 focus:ring-white`}
                    value={value}
                    onValueChange={code => {
                        setCodeSnippet((prev) => {
                            return { ...prev, script: code }
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
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-1 font-mono text-xs" onClick={() => setOpen(true)}>
                    <Code size={16} />
                    <span>{localeString['code'][locale]}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md gap-5">
                <DialogHeader>
                <DialogTitle>{localeString['code'][locale]}</DialogTitle>
                <DialogDescription>
                    {localeString['codeSnippetWrittenByAi'][locale]}
                </DialogDescription>
                </DialogHeader>
                <div className="flex items-start space-x-2 h-[60vh] overflow-auto">
                    <div className="grid flex-1 gap-2">
                        {codeSnippet && codeSnippet.script ? CodeEditorField('script',codeSnippet.script,false) : null}
                        {codeSnippet && codeSnippet.dependencies ? CodeEditorField('dependencies',codeSnippet.dependencies,false) : null}
                        {codeSnippet && codeSnippet.input_schema ? CodeEditorField('input_schema',codeSnippet.input_schema,false) : null}
                        {codeSnippet && codeSnippet.testArgu ? CodeEditorField('testArgu',codeSnippet.testArgu,false) : null}
                    </div>
                    {/* <Button type="submit" size="sm" className="px-3">
                    </Button> */}
                </div>
                {/* <DialogFooter className="justify-end">
                    <Button 
                        type="submit" 
                        variant="secondary"
                        disabled={load}
                        onClick={()=>setOpen(false)}
                    >
                        {(load === false) ? localeString['save'][locale] : <Loader />}
                    </Button>
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}
