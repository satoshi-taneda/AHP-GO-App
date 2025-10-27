"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type Props = {
  item: {
    name: string
    image: string
    url: string
    price: number
  }
  onSave: () => void
}

export default function ProductCard({ item, onSave }: Props) {
  return (
    <div className="border rounded-lg p-3 flex flex-col justify-between">
      <img
        src={item.image}
        alt={item.name}
        className="w-48 h-auto object-cover rounded"
      />
      <div className="mt-2 space-y-1">
        <p className="font-medium text-sm line-clamp-2">{item.name}</p>
        <p className="text-gray-600 text-sm">{item.price.toLocaleString()}円</p>
      </div>
      <div className="flex justify-between mt-3">
        <a
          href={item.url}
          target="_blank"
          className="text-blue-600 text-sm hover:underline"
        >
          詳細
        </a>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSave}
        >
          <Plus className="h-4 w-4 mr-1" />追加
        </Button>
      </div>
    </div>
  )
}
