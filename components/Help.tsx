"use client"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface HelpProps {
  text: string
  title?: string
  more?: string
}

export const Help = ({ text, title = "ヘルプ", more }: HelpProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="inline-flex items-center">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => more && setOpen(true)}
              className="ml-2 inline-flex items-center text-gray-400 hover:text-gray-600"
                aria-label="ヘルプ"
            >
              <HelpCircle size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs text-xs bg-gray-900 text-white"
          >
            <div className="flex flex-col gap-1">
              <span>{text}</span>
              {more && (
                <button
                  onClick={() => setOpen(true)}
                  className="text-blue-300 underline mt-1 self-start hover:text-blue-200"
                >
                  詳細を見る
                </button>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Dialog(クリックで開閉) */}
      {more && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="text-gray-700 text-sm whitespace-pre-line">
                {more}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
