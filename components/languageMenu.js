"use client";

import * as React from "react"
import { isMobile } from 'react-device-detect';
import localeString from "@/lib/locale.json";
import { Check, ChevronsUpDown, Languages } from "lucide-react";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"


export default function LanguageMenu({ callBack , locale }) {
    const [open, setOpen] = React.useState(false)
    const[locales] = React.useState(Object.keys(localeString['language']));
    if (!isMobile) {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-fit justify-start gap-2 text-slate-800 dark:text-white">
                <Languages className="w-5 h-5 " aria-hidden="true"/>
                {localeString['language'][locale]}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <StatusList setOpen={setOpen} locales={locales} locale={locale} />
          </PopoverContent>
        </Popover>
      )
    }
   
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="w-fit justify-start">
            <Languages className="w-5 h-5 text-slate-800 dark:text-white" aria-hidden="true"/>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <StatusList setOpen={setOpen} locales={locales} locale={locale} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }
  function StatusList({ setOpen,  locales , locale }) {
    // const router = useRouter();
    const localesOptions = locales.map((locale) => ({
      value: locale,
      label: localeString['language'][locale],
    }))
    return (
        <Command>
            <CommandInput placeholder={localeString['search'][locale]} />
            <CommandList>
                <CommandEmpty>{localeString['noResult'][locale]}</CommandEmpty>
                <CommandGroup>
                {localesOptions.map((localeOption) => (
                    <CommandItem
                        className="py-5 lg:p-2"
                        key={localeOption.value}
                        value={localeOption.label}
                        onSelect={(currentValue) => {
                            const menuLocale = localesOptions.find((option) => option.label === currentValue).value
                            // Save the locale to localStorage to reload the page with the same locale
                            localStorage.setItem('locale', menuLocale)
                            setOpen(false);
                            window.location.replace(`/${menuLocale}/${window.location.pathname.split('/').slice(2).join('/')}`);
                            // router.push(`/${menuLocale}`);
                            // window.location.reload(`/${menuLocale}`);
                        }}
                    >
                    <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            localeOption.value === locale ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {localeOption.label}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}