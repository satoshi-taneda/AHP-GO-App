"use client";
import { useState } from "react";

export default function AhpComparisonSlider({
  value,
  onValueChange // 追加
}: {
  value: number;
  onValueChange?: (value: number) => void
}) {
  // const [value, setValue] = useState(0);
  const handleChange= (val: number) => {
    onValueChange?.(val) // 親に通知
  }

  return (
    <div className="shadow-xs max-w-xl mx-auto my-4">
      <div className="relative w-full">
        <input
          type="range"
          min={-6}
          max={6}
          step={1}
          value={value}
          onChange={(e: any) => handleChange(parseInt(e.target.value))}
          className="shadow-md w-full appearance-none bg-gradient-to-r from-pink-200 via-gray-300 to-blue-200 h-3 rounded-full accent-blue-600"
        />

        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            background: #fff8ff;
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
    </div>
  );
}

