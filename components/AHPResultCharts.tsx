"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const  COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA"]

export default function AHPResultCharts({
  project,
}: {
  project: {
    criteria: {id: string; name: string; weight: number}[]
    alternatives: {id: string; name: string; weight: number}[]
  }
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4 p-4">
      {/* 評価基準 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">評価基準のウェイト</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={project.criteria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
            <Legend />
            <Bar dataKey="weight" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* 候補スコア */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">候補のスコア</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart data={project.alternatives}>
            <Pie
              className="text-sm"
              data={project.alternatives}
              dataKey="weight"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent}) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="12"
                  >
                    {(percent * 100).toFixed(0)}%
                  </text>
                )
              }}
            >
              {project.alternatives.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
            <Legend className="text-xs" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
