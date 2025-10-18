"use client"
import { useEffect, useState } from "react"
import { useAHP } from "@/contexts/AHPContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function GoalInput() {
  const [localGoal, setLocalGoal] = useState("")
  const { project, updateGoal } = useAHP()

  // project.goalの初期値・更新を反映
  useEffect(() => {

    if (project?.goal !== undefined) {
      setLocalGoal(project.goal)
    }
  }, [project?.goal])

  const handleBlur = () => {
    if (localGoal !== project?.goal) {
      updateGoal(localGoal)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-3">
        <Label htmlFor="goal" className="text-xl font-semibold">
          最終目標(Goal)
          <div className="flex justify-between">
          <p className="font-normal py-2 text-sm text-muted-foreground"> -- 最終的に決めたいことを入力 --</p>
          {project?.goal === ""
                ? (
                    <div className="font-normal flex items-center text-sm gap-2 p-2 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                       <span>必須入力項目です</span>
                    </div>
                  )
                : null}
          </div>
        </Label>
        <Input
          id="goal"
          placeholder="例)最適なノートパソコンを選ぶ！"
          value={localGoal}
          onChange={(e) => setLocalGoal(e.target.value)}
          onBlur={handleBlur}
          className="flex-1 mr-2 font-medium"
        >
        </Input>
      </div>
    </Card>
  )
}
