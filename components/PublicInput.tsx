"use client"
import { useEffect, useState } from "react"
import { useAHP } from "@/contexts/AHPContext"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Globe } from "lucide-react"

export function PublicInput() {
  const [status, setStatus] = useState(false)
  const { project, updatePublished } = useAHP()

  // project.publicの初期値・更新を反映
  useEffect(() => {
    if (project?.published !== undefined) { setStatus(project.published)
    }
  }, [project?.published])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
   let isPublic
   e.target.value === "public" ? isPublic = true : isPublic = false
   updatePublished(isPublic)
   setStatus(isPublic)
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-muted/50">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="goal" className="text-xl font-semibold">
            公開設定
          </Label>
          {project?.published && (
            <div className="flex text-sm gap-2 p-1 border border-blue-500/30 bg-blue-500/5 text-blue-500 rounded-lg">
              <Globe className="w-5 h-5 text-blue-700" />
               <span>全ユーザに公開されます</span>
            </div>
          )}
        </div>
        <div className="flex justify-start">
          <select
            id="publishStatus"
            value={ status ? "public" : "private" }
            onChange={handleChange}
            className="border rounded-lg px-3 py-2"
          >
            <option value="private">非公開</option>
            <option value="public">公開</option>
          </select>
        </div>
      </div>
    </Card>
  )
}
