"use client";
export default function AhpComparisonSlider({
  itemA,
  itemB,
  value,
  onValueChange,
}: {
  itemA: string,
  itemB: string,
  value: number,
  onValueChange?: (value: number) => void
}) {
  const handleChange = (val: number) => {
    onValueChange?.(val)
  }

  const getLabel = (val: number) => {
    if (val === -9) return "未選択"
    if (val === 0) return "同じくらい重要";
    const degree = Math.abs(val);
    const labels = ["わずかに", "やや", "かなり", "非常に", "極めて", "圧倒的に"];
    const intensity =
      labels[Math.min(Math.floor((degree - 1) / 1.5), labels.length - 1)];
    return val > 0
      ? `『${itemB}』が${intensity}重要`
      : `『${itemA}』が${intensity}重要`;
  };

  return (
    <div className="p-4 border rounded-xl bg-white shadow w-full max-w-2xl mx-auto space-y-1">
      {/* テキスト表示 */}
      <p className="text-lg text-center font-medium text-blue-700">
        {getLabel(value)}
      </p>

      <div className="relative w-full">
        <input
          type="range"
          min={-8}
          max={8}
          step={1}
          value={value}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className="w-full appearance-none bg-gradient-to-r from-pink-200 via-gray-300 to-blue-200 h-4 rounded-full accent-blue-600"
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 25px;
            height: 25px;
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

      {/* 現在値をスライダー中央に表示 */}
      {value !== -9 && (
        <span className="text-center text-muted-foreground font-semibold text-3xl">{Math.abs(value) + 1}</span>
      )}
      <div className="flex justify-between text-sm text-gray-600">
        <span>←{itemA}重視</span>
        <span>{itemB}重視→</span>
      </div>
    </div>
  );
}
