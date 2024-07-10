import packageJson from '../package.json';

export default function CopyRight({ colorClass }) {
    return (
        <div className={`w-fit flex flex-col p-2 items-center justify-center align-middle text-xs gap-1 text-center text-black dark:text-gray-200`}>
            <span>{`Copyright © ${new Date().getFullYear()} Kios Tech Inc.`}{` v ${packageJson.version}`}</span>
        </div>
    )
}