"use client"

type Project = {
  project_id: string
  goal: string
  updated_at: string
  customer_id: string
  customer: {
    name: string
  }
}

export default function ProjectCard({ project }: { project: Project }) {
  const displayname = project.customer.name || "ゲスト"

  return (
    <div className="p-4 border rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-500 transition-shadow">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <p>{new Date(project.updated_at).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })}
          </p>
          <p>{displayname}</p>
        </div>
        <h2 className="font-semibold text-xl mt-2">{project.goal}</h2>
    </div>
  )
}
