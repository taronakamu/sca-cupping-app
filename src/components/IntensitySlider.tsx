import { Label } from "./ui/label";

interface IntensitySliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number; // 1-5
  onChange: (value: number) => void;
}

export function IntensitySlider({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: IntensitySliderProps) {
  return (
    <div className="space-y-3">
      <Label className="text-[#2C2C2C] dark:text-[#E5E5E5]">{label}</Label>
      <div className="space-y-2">
        <div className="relative">
          {/* Tick marks behind slider */}
          <div className="absolute top-0 left-0 right-0 h-2 flex items-center pointer-events-none">
            <div className="w-full flex justify-between px-3">
              {[1, 2, 3, 4, 5].map((tick) => (
                <div
                  key={tick}
                  className={`w-1 h-1 rounded-full transition-colors ${
                    value >= tick 
                      ? "bg-[#2C2C2C] dark:bg-[#E5E5E5]" 
                      : "bg-[#999] dark:bg-[#666]"
                  }`}
                />
              ))}
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="relative w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#E5E5E5] dark:bg-[#333] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2C2C2C] dark:[&::-webkit-slider-thumb]:bg-[#E5E5E5] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#2C2C2C] dark:[&::-moz-range-thumb]:bg-[#E5E5E5] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:active:scale-110 [&::-moz-range-thumb]:transition-transform"
          />
        </div>
        <div className="flex justify-between text-xs text-[#666] dark:text-[#999] px-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}
