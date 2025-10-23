import { Label } from "./ui/label";

interface RoastLevelSliderProps {
  value: number; // 1-5
  onChange: (value: number) => void;
}

export function RoastLevelSlider({ value, onChange }: RoastLevelSliderProps) {
  return (
    <div className="space-y-3">
      <Label className="text-[#1a1a1a] dark:text-[#E5E5E5] text-sm">Roast Level</Label>
      <div className="relative">
        {/* Tick marks */}
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center pointer-events-none z-10">
          <div className="w-full flex justify-between px-3">
            {[1, 2, 3, 4, 5].map((tick) => (
              <div
                key={tick}
                className={`w-1 h-1 rounded-full transition-colors ${
                  value === tick
                    ? "bg-[#1a1a1a] dark:bg-[#E5E5E5]"
                    : "bg-[#666] dark:bg-[#888]"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Gradient slider track */}
        <div className="relative h-8 rounded-lg overflow-hidden bg-gradient-to-r from-[#D5D5D5] via-[#808080] to-[#2C2C2C] dark:from-[#555] dark:via-[#333] dark:to-[#1a1a1a]">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="relative w-full h-8 appearance-none cursor-pointer bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1a1a1a] dark:[&::-webkit-slider-thumb]:border-[#E5E5E5] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1a1a1a] dark:[&::-moz-range-thumb]:border-[#E5E5E5] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:active:scale-110 [&::-moz-range-thumb]:transition-transform"
          />
        </div>
      </div>
    </div>
  );
}
