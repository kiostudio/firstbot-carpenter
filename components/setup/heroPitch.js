"use client";
import Image from "next/image";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import localeString from "@/lib/locale.json";
import CarpenterAvatar from "@/public/carpenter.jpeg";
 
export function HeroPitch({ locale }) {
    const sloganLocale = localeString["slogan"][locale];
    // "Become an AI programmer with Open Carpenter."
//   const words = [
//     {
//         text: "Become",
//     },
//     {
//         text: "an",
//     },
//     {
//         text: "AI",
//         className: "text-yellow-500 dark:text-yellow-500"
//     },
//     {
//         text: "programmer",
//         className: "text-yellow-500 dark:text-yellow-500"
//     },
//     {
//         text: "with",
//     },
//     {
//         text: "Open",
//         className: "text-yellow-500 dark:text-yellow-500"
//     },
//     {
//         text: "Carpenter.",
//         className: "text-yellow-500 dark:text-yellow-500"
//     },
//   ];
    const words = sloganLocale.split(" ").map((word, index) => {
        return {
            text: word,
            className: (word.includes("AI") || word.includes("Open") || word.includes("Carpenter") || word.includes("programmer")) ? "text-yellow-500 dark:text-yellow-500" : ""
        }
    });
  return (
    <div className="flex flex-col items-center justify-center w-full h-fit gap-4">
        <Image src={CarpenterAvatar} width={180} height={180} alt="logo" className='rounded-md' />
        <div className="w-full font-mono text-xl">
            <TypewriterEffect words={words} />
        </div>
        <p className="text-gray-400 text-sm w-full max-w-lg text-center font-mono">
            {localeString["carpenterDes"][locale]}
        </p>
    </div>
  );
}