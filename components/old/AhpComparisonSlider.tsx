"use client";
import { useState } from "react";

export default function AhpComparisonSlider({
  itemA,
  itemB,
  value,
  onValueChange // 追加
}: {
  itemA: string;
  itemB: string;
  value: number;
  onValueChange?: (value: number) => void
}) {
  // const [value, setValue] = useState(0);
  const handleChange= (val: number) => {
    onValueChange?.(val) // 親に通知
  }
  const getLabel = (val: number) => {
    if (val === 0) return "同等に重要";
    const degree = Math.abs(val);
    const labels = ["わずかに", "やや", "かなり", "非常に", "極めて", "圧倒的に"];
    const intensity =
      labels[Math.min(Math.floor((degree - 1) / 1.5), labels.length - 1)];
    return val > 0
      ? `${intensity}「${itemA}」が重要`
      : `${intensity}「${itemB}」が重要`;
  };

  return (
    <div className="p-6 border rounded-2xl bg-white shadow-md w-full max-w-xl mx-auto space-y-5">
      <h3 className="text-lg font-semibold text-center">
        一対比較: {itemA} vs {itemB}
      </h3>

      <div className="relative w-full">
        <input
          type="range"
          min={-6}
          max={6}
          step={1}
          value={value}
          onChange={(e: any) => handleChange(parseInt(e.target.value))}
          className="w-full appearance-none bg-gradient-to-r from-pink-200 via-gray-300 to-blue-200 h-2 rounded-full accent-blue-600"
        />
        {/* 現在値をスライダー中央に表示 */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-700">
          値: {value}
        </div>

        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            background: #2563eb;
            border-radius: 9999px;
            cursor: pointer;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
            transition: transform 0.1s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
        `}</style>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>{itemB} が重要</span>
        <span>{itemA} が重要</span>
      </div>

      {/* 数値もテキストも両方表示 */}
      <p className="text-center font-medium text-blue-700">
        {getLabel(value)}（値: {value}）
      </p>
    </div>
  );
}

